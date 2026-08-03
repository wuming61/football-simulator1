"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

let randomSeed=918273;const seededMath=Object.create(Math);seededMath.random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
const root=path.resolve(__dirname,"..");
const context={console,Intl,Date,Math:seededMath,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[]},navigator:{},addEventListener:()=>{},__test:{}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,createSquad,emptyMatchEvent,registerOurGoal,registerOpponentGoal,selectAttackPlayer,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS[0],squad=api.createSquad(club,null),lineup=squad.slice(0,11),opponents=lineup.map((player,index)=>({...player,id:`opponent-${index}`}));
const state={role:"coach",clubId:club.id,squad,controlledId:null};api.setTestState(state);
const createMatch=()=>({fixture:{home:true,international:false},minute:1,home:0,away:0,lineupIds:lineup.map(player=>player.id),opponentLineupIds:opponents.map(player=>player.id),opponentPlayers:opponents,playerEvents:{},opponentEvents:{},liveRatings:Object.fromEntries(lineup.map(player=>[player.id,6])),opponentRatings:Object.fromEntries(opponents.map(player=>[player.id,6])),scoreTimeline:[]});
const total=(events,key)=>Object.values(events).reduce((sum,event)=>sum+Number(event[key]||0),0),ourScorer=lineup.find(player=>player.position!=="GK"),ourCreator=lineup.find(player=>player.position!=="GK"&&player.id!==ourScorer.id),opponentScorer=opponents.find(player=>player.position!=="GK"),opponentCreator=opponents.find(player=>player.position!=="GK"&&player.id!==opponentScorer.id);

const createdMatch=createMatch();for(let index=0;index<2000;index++)api.registerOurGoal(createdMatch,ourScorer,ourCreator);
const createdRatio=total(createdMatch.playerEvents,"assists")/total(createdMatch.playerEvents,"goals");
assert.ok(createdRatio>=.83&&createdRatio<=.89,`goals with a clear creator must produce a realistic high assist rate, received ${createdRatio.toFixed(3)}`);
assert.equal(createdMatch.lastGoalDetail.scorerId,ourScorer.id,"the goal detail must retain the scorer");

const unstructuredMatch=createMatch();for(let index=0;index<2000;index++)api.registerOurGoal(unstructuredMatch,ourScorer,null);
const unstructuredRatio=total(unstructuredMatch.playerEvents,"assists")/total(unstructuredMatch.playerEvents,"goals");
assert.ok(unstructuredRatio>=.64&&unstructuredRatio<=.72,`unstructured goals must preserve a realistic no-assist share, received ${unstructuredRatio.toFixed(3)}`);
assert.ok(createdRatio>unstructuredRatio+.12,"a documented final pass must materially increase assist recognition");

const opponentMatch=createMatch();for(let index=0;index<2000;index++)api.registerOpponentGoal(opponentMatch,opponentScorer,opponentCreator);
const opponentRatio=total(opponentMatch.opponentEvents,"assists")/total(opponentMatch.opponentEvents,"goals");
assert.ok(Math.abs(opponentRatio-createdRatio)<.04,`both teams must use the same assist model (${createdRatio.toFixed(3)} vs ${opponentRatio.toFixed(3)})`);
assert.equal(opponentMatch.lastGoalDetail.team,"opponent");
assert.equal(opponentMatch.lastGoalDetail.scorerId,opponentScorer.id);

const positions=["GK","RB","CB","CB","LB","DM","CM","CM","RW","LW","ST"],balancedLineup=positions.map((position,index)=>({id:`distribution-${index}`,name:`Distribution ${index}`,position,overall:76,passing:76,dribbling:76,pace:76,shooting:76,fitness:90,morale:78}));
api.setTestState({role:"coach",clubId:club.id,squad:balancedLineup,controlledId:null});
const distributionMatch={fixture:{home:true,international:false},minute:45,substitutions:[],controlledMatchPlan:"balanced",lineupIds:balancedLineup.map(player=>player.id),ourPlayers:balancedLineup,playerEvents:{},liveRatings:Object.fromEntries(balancedLineup.map(player=>[player.id,6]))},providerPositions={};
for(let index=0;index<8000;index++){const scorer=api.selectAttackPlayer(distributionMatch,"ours",false),provider=api.selectAttackPlayer(distributionMatch,"ours",true,scorer);assert.notEqual(provider.id,scorer.id,"the scorer cannot also be credited as the final-pass creator");providerPositions[provider.position]=(providerPositions[provider.position]||0)+1;}
const frontlineAssists=["RW","LW","WG","ST","CF"].reduce((sum,position)=>sum+Number(providerPositions[position]||0),0),frontlineShare=frontlineAssists/8000,strikerShare=Number(providerPositions.ST||0)/8000;
assert.ok(frontlineShare>=.46&&frontlineShare<=.64,`front-line players must create a realistic share of chances, received ${(frontlineShare*100).toFixed(1)}%`);
assert.ok(strikerShare>=.045,`centre-forwards must remain meaningful assist providers, received ${(strikerShare*100).toFixed(1)}%`);
const fallbackMatch={fixture:{home:true,international:false},minute:1,home:0,away:0,lineupIds:balancedLineup.map(player=>player.id),ourPlayers:balancedLineup,opponentLineupIds:[],opponentPlayers:[],playerEvents:{},opponentEvents:{},liveRatings:Object.fromEntries(balancedLineup.map(player=>[player.id,6])),opponentRatings:{},scoreTimeline:[]},frontlineScorers=balancedLineup.filter(player=>["RW","LW","ST"].includes(player.position));
for(let index=0;index<6000;index++)api.registerOurGoal(fallbackMatch,frontlineScorers[index%frontlineScorers.length],null);
const fallbackAssistTotal=total(fallbackMatch.playerEvents,"assists"),fallbackFrontlineAssists=frontlineScorers.reduce((sum,player)=>sum+Number(fallbackMatch.playerEvents[player.id]?.assists||0),0),fallbackFrontlineShare=fallbackFrontlineAssists/Math.max(1,fallbackAssistTotal);
assert.ok(fallbackFrontlineShare>=.42,`fallback assist attribution must not collapse back into midfield concentration, received ${(fallbackFrontlineShare*100).toFixed(1)}%`);

console.log(`match assist tests passed: created ${createdRatio.toFixed(3)}, unstructured ${unstructuredRatio.toFixed(3)}, opponent ${opponentRatio.toFixed(3)}, front line ${(frontlineShare*100).toFixed(1)}%, striker ${(strikerShare*100).toFixed(1)}%, fallback front line ${(fallbackFrontlineShare*100).toFixed(1)}%`);
