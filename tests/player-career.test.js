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
  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,PLAYER_MATCH_PLANS,createSquad,ensurePlayerContract,ensurePlayerCareer,aiCoachProfile,matchSelectionScore,updatePlayerCareerAfterMatch,effectiveMatchAttribute,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test;
assert.ok(api.ensurePlayerCareer,"test hooks failed to load");

const club=api.CLUBS.map(item=>({item,count:api.REAL_PLAYERS.filter(player=>player.club===item.id).length})).sort((a,b)=>b.count-a.count)[0].item;
const sourcePlayer=api.REAL_PLAYERS.filter(player=>player.club===club.id).sort((a,b)=>b.overall-a.overall)[0];
const squad=api.createSquad(club,sourcePlayer);
squad.forEach(player=>api.ensurePlayerContract(player,2026));
const controlled=squad.find(player=>player.id==="controlled");
const fixture={id:"career-test",date:"2026-08-21",competition:"联赛",round:"第 4 轮",opponent:api.CLUBS.find(item=>item.id!==club.id).name,home:true,status:"upcoming"};
const legacyCareer={trust:67,relationships:{coach:81}};
const state={
  version:25,role:"player",clubId:club.id,controlledId:controlled.id,squad,season:2026,date:"2026-08-21",
  played:3,leaguePosition:5,schedule:[fixture],playerCareer:legacyCareer
};
api.setTestState(state);

const migrated=api.ensurePlayerCareer(state);
assert.equal(migrated,legacyCareer,"career migration must preserve the live object reference");
assert.equal(migrated.relationships.coach,81,"existing relationship values must survive migration");
assert.equal(typeof migrated.weeklyPlan,"string","legacy saves must receive a weekly plan");
assert.ok(Array.isArray(migrated.pendingIssues),"legacy saves must receive performance issue storage");
assert.ok(Array.isArray(migrated.requests),"legacy saves must receive agent request storage");

const profile=api.aiCoachProfile(state,club.id,club.coach||club.id);
controlled.fitness=92;controlled.lastRating=6.7;controlled.consecutiveStarts=0;controlled.lastMatchMinutes=0;controlled.lastMatchDate=null;
migrated.trust=40;migrated.tactical=55;migrated.professionalism=55;
const lowTrustScore=api.matchSelectionScore(controlled,fixture,profile,false,"balanced");
migrated.trust=90;migrated.tactical=80;migrated.professionalism=80;
const highTrustScore=api.matchSelectionScore(controlled,fixture,profile,false,"balanced");
assert.ok(highTrustScore>lowTrustScore+5,"trust, tactical understanding and professionalism must materially affect selection");

migrated.pendingIssues=[];migrated.benchStreak=0;migrated.matchPlan="balanced";
api.updatePlayerCareerAfterMatch(controlled,6,0,fixture);
assert.equal(migrated.benchStreak,1,"one unused-substitute appearance must start the bench streak");
assert.equal(migrated.pendingIssues.length,0,"one match without minutes must not be misread as a 6.00 rating");
api.updatePlayerCareerAfterMatch(controlled,6,0,fixture);
assert.equal(migrated.pendingIssues.length,1,"two consecutive matches without minutes must create a selection response");
assert.equal(migrated.pendingIssues[0].type,"selection");

migrated.pendingIssues=[];migrated.benchStreak=0;
api.updatePlayerCareerAfterMatch(controlled,5.8,55,fixture);
assert.equal(migrated.pendingIssues.length,1,"a genuinely poor on-field rating must create a performance response");
assert.equal(migrated.pendingIssues[0].type,"poor-form");

migrated.confidence=60;migrated.tactical=60;
const match={minute:0,substitutions:[],controlledMatchPlan:"balanced"};
const balancedShooting=api.effectiveMatchAttribute(controlled,"shooting",match,"ours");
match.controlledMatchPlan="attack";
const attackingShooting=api.effectiveMatchAttribute(controlled,"shooting",match,"ours");
assert.equal(attackingShooting-balancedShooting,api.PLAYER_MATCH_PLANS.attack.attributes.shooting,"match plans must alter the controlled player's on-field attributes");

console.log(`player career tests passed: migration, selection ${lowTrustScore.toFixed(2)} -> ${highTrustScore.toFixed(2)}, issues and match plan`);
