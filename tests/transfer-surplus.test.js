"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = {
  console,
  Intl,
  Date,
  Math,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
  document:{getElementById:()=>({}),querySelectorAll:()=>[]},
  navigator:{},
  addEventListener:()=>{},
  __test:{}
};
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "data/dongqiudi-data.js"), "utf8"), context);

let source = fs.readFileSync(path.join(root, "app.js"), "utf8");
source = source.replace(/\n  render\(\);\n\}\)\(\);\s*$/, `
  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,AI_SQUAD_LIMITS,AI_TRANSFER_MINIMUMS,createSquad,createTransferMarket,ensurePlayerContract,aiSurplusCandidates,createAiSurplusSaleRumor,createCoachTransferReport,completeTransfer,playerProfileData,positionUnit,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source, context);

const api = context.__test;
assert.ok(api.CLUBS, "test hooks failed to load");

const largestClub = api.CLUBS.map(club=>({club,count:api.REAL_PLAYERS.filter(player=>player.club===club.id).length})).sort((a,b)=>b.count-a.count)[0].club;
const controlledSource = api.REAL_PLAYERS.filter(player=>player.club===largestClub.id).sort((a,b)=>b.overall-a.overall)[0];
const originalSquad = api.createSquad(largestClub, controlledSource);
originalSquad.forEach(player=>api.ensurePlayerContract(player, 2026));

function makeSave(role) {
  const squad=originalSquad.map(player=>({...player,contract:{...player.contract},development:{...player.development}}));
  return {version:25,role,clubId:largestClub.id,controlledId:role==="player"?"controlled":null,squad,season:2026,date:"2026-08-01",played:0,funds:9999,media:[],notifications:[],transferRequestsLog:[],transferHistory:[],transferMarket:api.createTransferMarket(2026)};
}

const playerSave = makeSave("player");
assert.ok(playerSave.squad.length>api.AI_SQUAD_LIMITS.soft, "fixture must use an oversized squad");
const initialCandidates = api.aiSurplusCandidates(playerSave, playerSave.clubId);
assert.ok(initialCandidates.length, "oversized squad should produce surplus candidates");
assert.ok(initialCandidates.every(item=>item.player.id!==playerSave.controlledId), "controlled player must be protected");

const topByRole = new Map();
for (const player of playerSave.squad) {
  const role=api.positionUnit(player.position),current=topByRole.get(role);
  if(!current||player.overall>current.overall)topByRole.set(role,player);
}
const candidateNames = new Set(initialCandidates.map(item=>item.player.name));
for (const player of topByRole.values())assert.ok(!candidateNames.has(player.name), `role leader ${player.name} must be protected`);

Object.keys(playerSave.transferMarket.budgets).forEach(clubId=>{playerSave.transferMarket.budgets[clubId]=9999;});
const generatedRumor=api.createAiSurplusSaleRumor(playerSave,playerSave.date,playerSave.clubId);
assert.ok(generatedRumor?.sellerDriven,"seller-driven market should create an outgoing rumor");
assert.equal(generatedRumor.fromId,playerSave.clubId,"preferred AI coach should clean its own oversized squad");
assert.match(generatedRumor.reason,/阵容人数过多|人员冗余/,"rumor should explain the squad-planning reason");
const departingPlayer=playerSave.squad.find(player=>player.id===generatedRumor.sourcePlayerId);
departingPlayer.appearances=14;departingPlayer.goals=3;departingPlayer.assists=4;departingPlayer.ratingTotal=95.2;
departingPlayer.careerStats=[{id:"career-2025",season:2025,club:largestClub.name,clubId:largestClub.id,appearances:28,goals:5,assists:7,average:6.91,overallStart:72,overallEnd:74,change:2}];
assert.equal(api.completeTransfer(playerSave,generatedRumor,playerSave.date,true),true,"generated surplus sale should complete");
const completedRecord=playerSave.transferMarket.records[0];
assert.equal(completedRecord.careerSegment.appearances,14,"origin-club appearances must be captured at transfer time");
assert.equal(completedRecord.careerSegment.goals,3,"origin-club goals must be captured at transfer time");
assert.equal(completedRecord.careerSegment.assists,4,"origin-club assists must be captured at transfer time");
assert.equal(completedRecord.careerHistory[0].season,2025,"earlier seasons must remain attached to the player");
assert.ok(playerSave.transferHistory.some(record=>record.id===completedRecord.id),"transfer must persist beyond the seasonal market ledger");
api.setTestState(playerSave);
const transferredProfile=api.playerProfileData(completedRecord);
assert.equal(transferredProfile.clubId,generatedRumor.toId,"profile must resolve the player's latest club");
assert.ok(transferredProfile.transferHistory.some(record=>record.id===completedRecord.id),"profile must show transfer history");
assert.ok(transferredProfile.careerStats.some(row=>row.clubId===largestClub.id&&row.appearances===14),"profile must show exact origin-club segment stats");
assert.ok(transferredProfile.careerStats.some(row=>row.season===2025&&row.appearances===28),"profile must retain earlier career seasons");

let sales=1;
while(playerSave.squad.length>api.AI_SQUAD_LIMITS.soft&&sales<30){
  const candidate=api.aiSurplusCandidates(playerSave,playerSave.clubId)[0];
  if(!candidate)break;
  const buyer=api.CLUBS.find(club=>club.id!==playerSave.clubId);
  playerSave.transferMarket.budgets[buyer.id]=9999;
  const player=candidate.player,canonical=candidate.canonical;
  const rumor={id:`test-${sales}`,season:2026,windowKey:"summer-2026",status:"active",confidence:100,playerId:canonical?.id||player.id,sourcePlayerId:player.id,playerName:player.name,position:player.position,overall:player.overall,potential:player.potential,fromId:playerSave.clubId,toId:buyer.id,fee:1,reason:candidate.reason};
  assert.equal(api.completeTransfer(playerSave,rumor,playerSave.date,true),true,"surplus sale should complete");
  assert.ok(playerSave.squad.some(item=>item.id===playerSave.controlledId),"controlled player must remain after teammate sale");
  sales++;
}

assert.ok(sales>0,"at least one surplus player should be sold");
assert.ok(playerSave.squad.length<=api.AI_SQUAD_LIMITS.soft,"AI should stop at a healthy squad size");
assert.equal(api.aiSurplusCandidates(playerSave,playerSave.clubId).length,0,"healthy squad should not keep producing sales");
const finalRoleCounts={};playerSave.squad.forEach(player=>{const role=api.positionUnit(player.position);finalRoleCounts[role]=(finalRoleCounts[role]||0)+1;});
for(const [role,minimum] of Object.entries(api.AI_TRANSFER_MINIMUMS))assert.ok((finalRoleCounts[role]||0)>=minimum,`${role} depth dropped below minimum`);

const coachSave = makeSave("coach");
const beforeCoachSquad=coachSave.squad.length,report=api.createCoachTransferReport(coachSave,coachSave.date);
assert.ok(report?.advisoryOnly,"coach career should receive an advisory-only surplus report");
assert.equal(report.fromId,coachSave.clubId,"surplus report should concern the user's club");
assert.equal(coachSave.squad.length,beforeCoachSquad,"coach advisory must not sell a player automatically");

console.log(`transfer surplus tests passed: ${largestClub.name}, ${originalSquad.length} -> ${playerSave.squad.length}, ${sales} sales`);
