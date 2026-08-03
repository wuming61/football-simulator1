"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root=path.resolve(__dirname,"..");
const context={
  console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
  document:{getElementById:()=>({appendChild:()=>{}}),querySelectorAll:()=>[],createElement:()=>({remove:()=>{}})},
  navigator:{},addEventListener:()=>{},__test:{}
};
context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,PLAYER_MATCH_PLANS,createSquad,ensurePlayerContract,ensurePlayerCareer,grantPerformanceResponse,temporaryBoostSummary,recentPlayerAverage,settlePerformanceResponse,effectiveMatchAttribute,controlledPlayerInvolvementBoost,positionAwareRating,renderPlayerHome,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS[0],sourcePlayer=api.REAL_PLAYERS.find(player=>player.club===club.id&&player.position!=="GK"),squad=api.createSquad(club,sourcePlayer);
squad.forEach(player=>api.ensurePlayerContract(player,2026));
const controlled=squad.find(player=>player.id==="controlled"),fixture={id:"recovery-fixture",date:"2026-08-10",competition:"联赛",round:"第 1 轮",opponent:api.CLUBS[1].name,home:true,status:"upcoming"};
const state={version:28,role:"player",person:controlled.name,clubId:club.id,controlledId:controlled.id,squad,season:2026,date:"2026-08-03",schedule:[fixture],playerCareer:null};
api.setTestState(state);
const career=api.ensurePlayerCareer();

api.grantPerformanceResponse("review");
assert.equal(career.temporaryAttributeBoosts.passing,3,"video review must grant +3 passing");
assert.equal(career.temporaryAttributeBoosts.defending,2,"video review must grant +2 defending");
assert.equal(career.temporaryBoostMatches,3,"recovery boosts must last three meaningful appearances");
assert.equal(career.temporaryBuffs.length,1,"a temporary response must be stored as an independent buff instance");
assert.match(api.temporaryBoostSummary(career),/传球 \+3/,"the detailed boost must be visible to the player");
assert.match(api.renderPlayerHome(),/录像复盘正在转化为比赛状态/,"the player home must explain which choice is active");
assert.match(api.renderPlayerHome(),/剩余 3 场有效出场/,"the player home must show the remaining duration");

const match={minute:20,substitutions:[],controlledMatchPlan:"balanced",lineupIds:[controlled.id]};
career.responseMomentum=0;
const passingWithBoost=api.effectiveMatchAttribute(controlled,"passing",match,"ours");
career.temporaryBuffs=[];career.temporaryBoostMatches=0;
const passingWithoutBoost=api.effectiveMatchAttribute(controlled,"passing",match,"ours");
assert.equal(passingWithBoost-passingWithoutBoost,3,"temporary detailed attributes must feed the match engine exactly");

career.temporaryBuffs=[];career.temporaryAttributeBoosts={};career.temporaryBoostMatches=0;career.responseMatches=0;career.responseMomentum=0;career.confidence=60;career.chemistry=60;career.tactical=60;career.pressure=35;
const normalInvolvement=api.controlledPlayerInvolvementBoost(match,true);
api.grantPerformanceResponse("extra");
const recoveryInvolvement=api.controlledPlayerInvolvementBoost(match,true);
assert.ok(recoveryInvolvement>=normalInvolvement+.2,"an active recovery choice must materially increase match involvement");

career.responseMatches=0;career.temporaryBuffs=[];career.temporaryBoostMatches=0;career.responseMomentum=0;
const neutralEvent={},neutralRating=api.positionAwareRating(controlled,neutralEvent,60,{result:0,conceded:0});
assert.equal(neutralRating,6.18,"a neutral full-match performance must use the calibrated baseline");
career.responseMatches=3;career.responseMomentum=6;
const neutralRecoveryRating=api.positionAwareRating(controlled,{},60,{result:0,conceded:0});
const recoveryEvent={keyPasses:20,chancesCreated:20,successfulDribbles:20,progressivePasses:20,recoveries:20,pressuresWon:20,tacklesWon:20,interceptions:20};
const recoveryRating=api.positionAwareRating(controlled,recoveryEvent,60,{result:0,conceded:0});
career.responseMatches=0;career.responseMomentum=0;
const sameActionsWithoutResponse=api.positionAwareRating(controlled,{...recoveryEvent},60,{result:0,conceded:0});
assert.ok(recoveryRating-sameActionsWithoutResponse<=.231,"recovery rating feedback must remain capped");
assert.ok(neutralRecoveryRating<7,"recovery must not manufacture a high rating without positive actions");

api.grantPerformanceResponse("review");
api.settlePerformanceResponse(career,6.6,19);
assert.equal(career.temporaryBoostMatches,3,"a cameo under 20 minutes must not consume a recovery match");
api.settlePerformanceResponse(career,6.6,70);
api.settlePerformanceResponse(career,6.7,70);
api.settlePerformanceResponse(career,7.1,70);
assert.equal(career.temporaryBoostMatches,0,"the temporary boost must expire after its promised appearances");
assert.deepEqual(Object.keys(career.temporaryAttributeBoosts),[],"expired detailed boosts must be cleared");
[6.2,6.3,6.4,6.5,6.6,6.7].forEach(rating=>api.settlePerformanceResponse(career,rating,70));
assert.equal(career.recentRatings.length,5,"recent form must retain only five meaningful appearances");
assert.equal(api.recentPlayerAverage(career),6.5,"recent form must reflect the latest five ratings");

const mistakeFunction=source.match(/  function registerMistake\([\s\S]*?\n  }\n\n  function registerCard/)[0];
assert.doesNotMatch(mistakeFunction,/Math\.random\(\)<\.2\?controlled/,"the controlled player must not have a fixed special mistake chance");
assert.match(mistakeFunction,/effectiveMatchAttribute\(item,"defending"/,"mistakes must be weighted by relevant attributes");

console.log("player form recovery tests passed: detailed boosts, involvement, rating calibration, expiry and recent form");
