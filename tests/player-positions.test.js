"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,performance:{now:()=>0},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[]},navigator:{},addEventListener:()=>{},__test:{}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{POSITION_LABELS,POSITION_ORDER,AI_FORMATIONS,playerRoleLabel,positionSortRank,positionUnit,positionSlotFit,assignFormationSlots,aiSubstitutionRoleFit,migrateDetailedPositions,sourcePlayerAttributes,visualFormationPoints,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test;
assert.deepEqual(Array.from(api.POSITION_ORDER),["GK","RB","CB","LB","RWB","LWB","DM","CM","RM","LM","AM","RW","LW","CF","ST"]);
assert.deepEqual(Array.from(api.POSITION_ORDER,p=>api.playerRoleLabel(p)),["门将","右后卫","中后卫","左后卫","右边翼卫","左边翼卫","后腰","中前卫","右边前卫","左边前卫","前腰","右边锋","左边锋","影锋","中锋"]);
assert.equal(api.positionUnit("RWB"),"defence");assert.equal(api.positionUnit("RM"),"midfield");assert.equal(api.positionUnit("CF"),"attack");

const player=(id,position,overall=75)=>({id,name:id,position,overall,fitness:90,form:6.5});
const score=item=>item.overall;
const threeBackPlayers=[player("gk","GK"),player("cb1","CB"),player("cb2","CB"),player("cb3","CB"),player("rwb","RWB"),player("lwb","LWB"),player("dm","DM"),player("cm1","CM"),player("cm2","CM"),player("st","ST"),player("cf","CF"),player("rb","RB",90),player("lb","LB",90)];
const threeBack=api.AI_FORMATIONS.find(item=>item.name==="3-5-2"),threeAssignment=api.assignFormationSlots(threeBackPlayers,threeBack,score);
assert.equal(threeAssignment.valid,true);assert.deepEqual(Array.from(threeAssignment.assignments,item=>item.slot),Array.from(threeBack.slots));
assert.equal(threeAssignment.assignments.find(item=>item.slot==="RWB").player.position,"RWB");assert.equal(threeAssignment.assignments.find(item=>item.slot==="LWB").player.position,"LWB");
assert.equal(threeAssignment.assignments.filter(item=>item.slot==="CB"&&item.player.position==="CB").length,3);

const fourBack=api.AI_FORMATIONS.find(item=>item.name==="4-3-3"),fourBackPlayers=[player("gk","GK"),player("rb","RB"),player("lb","LB"),player("cb1","CB"),player("cb2","CB"),player("dm","DM"),player("cm1","CM"),player("cm2","CM"),player("rw","RW"),player("lw","LW"),player("st","ST"),player("rwb","RWB",92),player("lwb","LWB",92)],fourAssignment=api.assignFormationSlots(fourBackPlayers,fourBack,score);
assert.equal(fourAssignment.valid,true);assert.equal(fourAssignment.assignments.find(item=>item.slot==="RB").player.position,"RB");assert.equal(fourAssignment.assignments.find(item=>item.slot==="LB").player.position,"LB");

assert.notEqual(api.positionSlotFit("RM","RM"),api.positionSlotFit("RW","RM"));assert.notEqual(api.positionSlotFit("CF","CF"),api.positionSlotFit("ST","CF"));
assert.ok(api.aiSubstitutionRoleFit(player("rm","RM"),player("rm-out","RM"),"balanced")>api.aiSubstitutionRoleFit(player("rw","RW"),player("rm-out","RM"),"balanced"));
assert.notDeepEqual(api.sourcePlayerAttributes("RWB",75),api.sourcePlayerAttributes("RB",75));assert.notDeepEqual(api.sourcePlayerAttributes("CF",75),api.sourcePlayerAttributes("ST",75));

const legacy=[{id:"a",position:"DF",appearances:22,goals:1,careerArchive:{seasons:[{appearances:22}]}},{id:"b",position:"WG",assists:9},{id:"c",position:"CM",appearances:30},{id:"d",position:"ST",goals:18}];
api.migrateDetailedPositions(legacy,null);
assert.ok(["RB","CB","LB","RWB","LWB"].includes(legacy[0].position));assert.ok(["RW","LW","RM","LM"].includes(legacy[1].position));
assert.equal(legacy[2].position,"CM","explicit central-midfield positions must not be reassigned without source data");assert.equal(legacy[3].position,"ST","explicit striker positions must not be reassigned without source data");
assert.equal(legacy[0].appearances,22);assert.equal(legacy[0].careerArchive.seasons[0].appearances,22);assert.equal(legacy[1].assists,9);

const match={fixture:{home:true},visualAction:{team:"ours",kind:"build"}},visualPlayers=[player("gk","GK"),player("cb1","CB"),player("cb2","CB"),player("cb3","CB"),player("rwb","RWB"),player("lwb","LWB"),player("dm","DM"),player("cm1","CM"),player("cm2","CM"),player("cf","CF"),player("st","ST")];
api.setTestState({clubId:"position-test",squad:visualPlayers,controlledId:null});
match.lineupIds=visualPlayers.map(item=>item.id);match.ourPlayers=visualPlayers;match.opponentLineupIds=[];match.opponentPlayers=[];match.formation="3-5-2";
const points=api.visualFormationPoints(match,"home");assert.equal(points.length,11);assert.equal(points.filter(point=>point[0]===22).length,3,"the 2D presentation must render a genuine three-centre-back line");assert.ok(points[4][0]>points[1][0],"wing-backs must start higher than centre-backs");assert.ok(points[9][0]<points[10][0],"the second striker must play behind the centre-forward line");

console.log("player position tests passed: 15 roles, formation slots, migration, and 2D shape");
