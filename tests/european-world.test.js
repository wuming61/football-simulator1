"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:id=>id==="toast-region"?{appendChild:()=>{}}:{},querySelectorAll:()=>[],createElement:()=>({remove:()=>{}})},navigator:{},addEventListener:()=>{},__test:{}};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");source=source.replace("  function render() {\n","  function render() { return; }\n  function renderDisabled() {\n");source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`\n  Object.assign(window.__test,{CLUBS,LEAGUES,EUROPEAN_COMPETITIONS,generateSchedule,createEuropeanWorld,simulateEuropeanWorld,europeanStandings,europeanLeaguePosition,renderEuropeanCenter,setTestState:value=>{state=value;}});\n})();\n`);vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS.filter(item=>api.LEAGUES[item.league]?.tier===1).sort((a,b)=>b.prestige-a.prestige)[0],schedule=api.generateSchedule(club,2026),userEuropean=schedule.filter(fixture=>fixture.phase==="league"&&api.EUROPEAN_COMPETITIONS[fixture.competitionKey]);
assert.ok(userEuropean.length>=6,"elite club should have a European league-phase schedule");
const save={version:42,role:"coach",person:"Europe Test",clubId:club.id,season:2026,date:"2026-08-01",schedule,europeanCompetitionKey:userEuropean[0].competitionKey,europeanRoundFilters:{},worldHistory:{seasons:[],competitions:{},clubHonors:{},promotions:[]},honors:[]};save.europeanWorld=api.createEuropeanWorld(save);

const participantIds=[];
for(const config of Object.values(api.EUROPEAN_COMPETITIONS)){
  const competition=save.europeanWorld.competitions[config.key];assert.equal(competition.clubs.length,36,`${config.name} should have 36 clubs`);assert.equal(competition.rounds.length,config.matches,`${config.name} should use its real league-stage round count`);
  const pairKeys=new Set(),appearances=new Map();competition.rounds.forEach(round=>{assert.equal(round.matches.length,18,`${config.name} round should contain 18 matches`);round.matches.forEach(match=>{const pair=[match.homeId,match.awayId].sort().join("|");assert.ok(!pairKeys.has(pair),`${config.name} clubs should not meet twice in the league phase`);pairKeys.add(pair);appearances.set(match.homeId,(appearances.get(match.homeId)||0)+1);appearances.set(match.awayId,(appearances.get(match.awayId)||0)+1);});});competition.clubs.forEach(team=>assert.equal(appearances.get(team.id),config.matches,`${team.name} should play ${config.matches} league-stage matches`));participantIds.push(...competition.clubs.map(team=>team.id));
}
assert.equal(new Set(participantIds).size,108,"a club must not appear in two European competitions in the same season");

for(const competitionKey of ["uel","uecl"]){
  const candidate=api.CLUBS.filter(item=>api.LEAGUES[item.league]?.tier===1).find(item=>api.generateSchedule(item,2026).some(fixture=>fixture.competitionKey===competitionKey));assert.ok(candidate,`a ${competitionKey} qualifier should exist`);const candidateSchedule=api.generateSchedule(candidate,2026),candidateSave={...save,clubId:candidate.id,schedule:candidateSchedule,europeanCompetitionKey:competitionKey,europeanRoundFilters:{}},candidateWorld=api.createEuropeanWorld(candidateSave),allIds=Object.values(candidateWorld.competitions).flatMap(competition=>competition.clubs.map(team=>team.id));assert.ok(candidateWorld.competitions[competitionKey].clubs.some(team=>team.id===candidate.id),`the player's club should appear in ${competitionKey}`);assert.equal(new Set(allIds).size,108,`${competitionKey} qualification must preserve unique European fields`);
}

const userFixture=userEuropean[0],userCompetition=save.europeanWorld.competitions[userFixture.competitionKey];api.simulateEuropeanWorld(save,userFixture.date);assert.equal(userCompetition.round,0,"the user's European round must wait for the real match result");userFixture.status="played";userFixture.score=userFixture.home?{home:2,away:1}:{home:1,away:2};api.simulateEuropeanWorld(save,userFixture.date);assert.equal(userCompetition.round,1,"the round should settle after the user's result exists");const userRow=api.europeanStandings(userCompetition).find(row=>row.id===club.id);assert.deepEqual({p:userRow.p,w:userRow.w,gf:userRow.gf,ga:userRow.ga,pts:userRow.pts},{p:1,w:1,gf:2,ga:1,pts:3});assert.equal(api.europeanLeaguePosition(save,userFixture.competitionKey),api.europeanStandings(userCompetition).findIndex(row=>row.id===club.id)+1);

api.setTestState(save);const html=api.renderEuropeanCenter();assert.match(html,/欧洲赛事中心/);assert.match(html,/联赛阶段积分榜/);assert.match(html,/第 1–8 名：直通十六强/);assert.match(html,/联赛阶段对局/);assert.match(html,/data-europe-competition="ucl"/);assert.match(html,/id="europe-round"/);assert.match(html,/user-result/);
save.europeanCompetitionKey="uecl";assert.match(api.renderEuropeanCenter(),/第 6 轮/);

console.log("European world tests passed: 108 unique clubs, live tables, complete matchdays and user-result synchronization");
