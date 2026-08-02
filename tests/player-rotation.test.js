"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = {
  console, Intl, Date, Math, setTimeout, clearTimeout, setInterval, clearInterval,
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
  document:{getElementById:()=>({}),querySelectorAll:()=>[]},
  navigator:{},addEventListener:()=>{},__test:{}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);

let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,createSquad,ensurePlayerContract,aiCoachProfile,chooseFormationPlayers,selectMatchBench,matchSelectionScore,controlledSelectionSummary,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test;
assert.ok(api.chooseFormationPlayers,"test hooks failed to load");

const club=api.CLUBS.map(item=>({item,count:api.REAL_PLAYERS.filter(player=>player.club===item.id).length})).sort((a,b)=>b.count-a.count)[0].item;
const sourcePlayer=api.REAL_PLAYERS.filter(player=>player.club===club.id).sort((a,b)=>b.overall-a.overall)[0];
const squad=api.createSquad(club,sourcePlayer);
squad.forEach(player=>api.ensurePlayerContract(player,2026));
const controlled=squad.find(player=>player.id==="controlled");
const state={version:25,role:"player",clubId:club.id,controlledId:controlled.id,squad,season:2026,date:"2026-08-21",played:3,leaguePosition:5,schedule:[]};
api.setTestState(state);

const fixture={id:"rotation-test",date:"2026-08-21",competition:"联赛",round:"第 4 轮",opponent:api.CLUBS.find(item=>item.id!==club.id).name,home:true,status:"upcoming"};
const profile=api.aiCoachProfile(state,club.id,club.coach||club.id);
const available=squad.filter(player=>!player.injured);

const forcedIdSelection=api.chooseFormationPlayers(available,controlled.id,profile.name,{profile,scorePlayer:player=>player.id===controlled.id?-100:Number(player.overall||0)}).players;
assert.ok(!forcedIdSelection.includes(controlled),"controlled id must not force a player into the starting XI");

controlled.fitness=96;controlled.lastRating=7.25;controlled.consecutiveStarts=0;controlled.lastMatchMinutes=0;controlled.lastMatchDate=null;
const freshScore=api.matchSelectionScore(controlled,fixture,profile,false,"balanced");
controlled.fitness=69;controlled.lastRating=5.85;controlled.consecutiveStarts=3;controlled.lastMatchMinutes=90;controlled.lastMatchDate="2026-08-18";
const loadedScore=api.matchSelectionScore(controlled,fixture,profile,true,"press");
assert.ok(loadedScore<freshScore-5,"fatigue, form and consecutive starts must materially lower selection score");

const scorePlayer=player=>api.matchSelectionScore(player,fixture,profile,true,"press");
const ordered=[...available].sort((a,b)=>scorePlayer(b)-scorePlayer(a));
const rotatedLineup=api.chooseFormationPlayers(ordered,null,profile.name,{profile,dense:true,scorePlayer}).players;
const rotatedBench=api.selectMatchBench(ordered,rotatedLineup,9);
assert.ok(!rotatedLineup.includes(controlled),"a fatigued controlled player must be eligible for rotation out of the XI");
const summary=api.controlledSelectionSummary(controlled,fixture,rotatedLineup,rotatedBench,true);
assert.match(summary.label,/替补待命|本场轮休/);
assert.match(summary.reason,/体能|密集赛程|状态|战术/);

controlled.injured=12;controlled.injury="腿筋拉伤";
const injurySummary=api.controlledSelectionSummary(controlled,fixture,[],[],true);
assert.equal(injurySummary.status,"rest");
assert.match(injurySummary.reason,/腿筋拉伤/);

console.log(`player rotation tests passed: ${controlled.name}, fresh ${freshScore.toFixed(2)} -> loaded ${loadedScore.toFixed(2)}, ${summary.label}`);
