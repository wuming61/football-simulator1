"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,".."),storage=new Map();
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},document:{getElementById:id=>id==="toast-region"?{appendChild:()=>{}}:{},querySelectorAll:()=>[],createElement:()=>({className:"",textContent:"",remove:()=>{}})},navigator:{},addEventListener:()=>{},confirm:()=>true,__test:{}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace("  function render() {\n","  function render() { return; }\n  function renderDisabled() {\n");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,createSquad,ensurePlayerContract,ensureYouthSystem,createYouthProspect,runYouthIntake,renderYouthAcademy,signYouthProspect,assignYouthMentor,advanceYouthDevelopment,promoteYouthProspect,upgradeYouthArea,addRetirementTemplate,rolloverYouthSeason,setTestState:value=>{state=value;},setActiveSave:value=>{activeSaveId=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS.find(item=>item.prestige>=85)||api.CLUBS[0],squad=api.createSquad(club,null);squad.forEach(player=>api.ensurePlayerContract(player,2026));
const state={version:29,role:"coach",person:"Youth Test Coach",clubId:club.id,squad,season:2026,date:"2026-08-03",view:"academy",funds:200,notifications:[],media:[],honors:[],history:[],schedule:[],played:0,wins:0,draws:0,losses:0,points:0,leaguePosition:1,transferHistory:[],transferRequestsLog:[],transferNegotiations:[]};
api.setTestState(state);api.setActiveSave("youth-test");
const system=api.ensureYouthSystem(state),academy=system.academy;
assert.ok(academy.facilities>=1&&academy.facilities<=5,"academy facilities must migrate into a 1-5 range");
assert.ok(academy.director.judgingPotential>=50,"a youth director must expose meaningful attributes");

academy.facilities=1;academy.recruitment=1;academy.director.judgingPotential=55;academy.director.workingWithYoungsters=55;
const lowClass=Array.from({length:240},(_,index)=>api.createYouthProspect(state,club,2030,index));
academy.facilities=5;academy.recruitment=5;academy.director.judgingPotential=94;academy.director.workingWithYoungsters=92;
const highClass=Array.from({length:240},(_,index)=>api.createYouthProspect(state,club,2031,index));
const lowElite=lowClass.filter(player=>player.potential>85).length,highElite=highClass.filter(player=>player.potential>85).length;
assert.ok(highElite>lowElite+25,`elite probability must rise materially with infrastructure (${lowElite} -> ${highElite})`);

const template={key:"hidden-superstar",nationality:"阿根廷",position:"ST",potential:94,availableIntakeYear:2027},regen=api.createYouthProspect(state,club,2027,"regen-check",{template});
assert.equal(regen.nationality,"阿根廷","regen nationality must match the retired template");
assert.equal(regen.position,"ST","regen position must match the retired template");
assert.ok(Math.abs(regen.potential-template.potential)<=3,"regen potential must stay within +/-3");
assert.equal(regen.originalName,undefined,"the original identity must never be stored on the generated player");

const event=api.runYouthIntake(state,"2027-03-15"),intake=academy.prospects.filter(player=>player.intakeYear===2027);
assert.equal(event.type,"youth","March 15 must pause career progression for youth intake");
assert.ok(intake.length>=10&&intake.length<=12,`youth intake must contain 10-12 trialists, received ${intake.length}`);
assert.equal(api.runYouthIntake(state,"2027-03-15"),null,"the same annual intake must not run twice");
const academyHtml=api.renderYouthAcademy();
assert.match(academyHtml,/青训设施/);assert.match(academyHtml,/青训总监/);assert.match(academyHtml,/潜力评估/);
assert.doesNotMatch(academyHtml,/originType|templateKey|hidden-superstar|转世|Regen/i,"the rendered academy must hide generation identity");

const trial=academy.prospects.find(player=>player.status==="trial");
api.signYouthProspect(trial.id);assert.equal(trial.status,"academy","a coach must be able to sign a trialist into the academy");
let mentor=api.createSquad(club,null).filter(player=>player.age>=23).sort((a,b)=>b.overall-a.overall).find(player=>{const unit=position=>position==="GK"?"g":["RB","LB","FB","DF","CB"].includes(position)?"d":["DM","CM","AM"].includes(position)?"m":"a";return unit(player.position)===unit(trial.position)&&player.overall>=trial.overall+8;});
if(mentor&&!state.squad.some(player=>player.id===mentor.id)){mentor={...mentor,id:"academy-mentor"};api.ensurePlayerContract(mentor,2026);state.squad.push(mentor);}
mentor=state.squad.filter(player=>player.age>=23).find(player=>{const unit=position=>position==="GK"?"g":["RB","LB","FB","DF","CB"].includes(position)?"d":["DM","CM","AM"].includes(position)?"m":"a";return unit(player.position)===unit(trial.position)&&player.overall>=trial.overall+8;});
assert.ok(mentor,"test squad must provide a valid same-unit mentor");api.assignYouthMentor(trial.id,mentor.id);assert.equal(trial.mentorId,mentor.id,"mentor assignment must persist");
const unmentored={...api.createYouthProspect(state,club,2028,"control"),status:"academy",trainingProgress:0};academy.prospects.push(unmentored);trial.trainingProgress=0;api.advanceYouthDevelopment(state);assert.ok(trial.trainingProgress>unmentored.trainingProgress,"mentoring must accelerate daily youth development");

const fundsBefore=state.funds,levelBefore=academy.facilities;academy.facilities=Math.min(4,academy.facilities);api.upgradeYouthArea("facilities");assert.equal(academy.facilities,levelBefore===5?5:levelBefore+1,"facility upgrade must increase one level");assert.ok(state.funds<fundsBefore,"facility upgrades must consume club funds");
trial.age=16;const squadBefore=state.squad.length;api.promoteYouthProspect(trial.id);assert.equal(state.squad.length,squadBefore+1,"eligible academy players must be promoted into the first team");assert.equal(state.squad.find(player=>player.id===trial.id).contract.role,"一线队候选","academy graduates need an appropriate first-team contract role");

const retiredPoolBefore=system.world.retiredTemplates.length;api.addRetirementTemplate(state,{name:"Anonymous Elite",nationality:"比利时",position:"CM",overall:90,potential:92},2026);assert.equal(system.world.retiredTemplates.length,retiredPoolBefore+1,"elite retirees must enter the hidden template pool");assert.equal(system.world.retiredTemplates.at(-1).originalName,undefined,"retirement templates must not store the original name");

assert.match(source,/return youthEvent\|\|playerEvent\|\|transferEvent\|\|offseasonEvent/ ,"the March 15 youth intake must take priority over same-day career, transfer and offseason events");
const aiClub=api.CLUBS.find(item=>item.id!==club.id)||api.CLUBS[1],globalProspect={...api.createYouthProspect(state,aiClub,2027,"global-rollover"),status:"academy",age:17,overall:60,potential:88};system.world.prospects=[globalProspect];
state.role="player";state.squad=state.squad.slice(0,24);const aiCandidate={...api.createYouthProspect(state,club,2027,"ai-promotion"),status:"academy",age:16,overall:66,potential:86};academy.prospects=[aiCandidate];const aiSquadBefore=state.squad.length,globalOverallBefore=globalProspect.overall;const promoted=api.rolloverYouthSeason(state);
assert.equal(promoted.length,1,"the AI coach must promote a qualified academy player when first-team space is available");assert.equal(state.squad.length,aiSquadBefore+1,"AI youth promotion must add the graduate to the first-team squad");assert.ok(!academy.prospects.some(player=>player.id===aiCandidate.id),"an AI-promoted player must leave the academy list");assert.equal(globalProspect.age,18,"global youth prospects must age between seasons");assert.ok(globalProspect.overall>globalOverallBefore,"global youth prospects must develop between seasons");

console.log(`youth academy tests passed: intake ${intake.length}, elite probability ${lowElite} -> ${highElite}, mentoring, promotion and rollover`);
