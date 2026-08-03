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
  Object.assign(window.__test,{CLUBS,createSquad,ensurePlayerContract,ensurePlayerDevelopment,playerAttributeSnapshot,recordAttributeDevelopment,settlePlayerSeason,renderPlayerProfileModal,ensureYouthSystem,createYouthProspect,advanceYouthDevelopment,graduateYouthPlayer,addUserSquadSigning,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS[0],squad=api.createSquad(club,null);squad.forEach(player=>api.ensurePlayerContract(player,2026));
const state={version:29,role:"coach",person:"Attribute Test Coach",clubId:club.id,squad,season:2026,date:"2027-05-30",view:"squad",funds:200,notifications:[],media:[],honors:[],history:[],schedule:[],played:34,wins:18,draws:8,losses:8,points:62,leaguePosition:4,transferHistory:[],transferRequestsLog:[],transferNegotiations:[]};
api.setTestState(state);

const growing=squad.find(player=>player.position!=="GK");growing.age=19;growing.potential=Math.max(90,growing.overall+5);growing.appearances=34;growing.ratingTotal=34*7.8;
const development=api.ensurePlayerDevelopment(growing,2026);development.minutes=2800;development.trainingScore=70;
const growthResult=api.settlePlayerSeason(growing);
assert.ok(growthResult.change>0,"a high-performing young player must improve at season settlement");
assert.equal(growing.lastAttributeDevelopment.reason,"赛季发展");
assert.ok(Object.values(growing.lastAttributeDevelopment.changes).some(change=>change>0),"season growth must record positive detailed-attribute changes");
const growthHtml=api.renderPlayerProfileModal(growing);
assert.match(growthHtml,/attribute-change up/,"positive development must render an up marker");
assert.match(growthHtml,/>\+\d+<\/small>/,"positive development must render an explicit +N value");
assert.match(growthHtml,/赛季发展 · 2026\/27/,"the attribute panel must identify the development period");

const declining=squad.find(player=>player!==growing&&player.position!=="GK");declining.age=36;declining.potential=declining.overall;declining.appearances=0;declining.ratingTotal=0;
api.ensurePlayerDevelopment(declining,2026);const declineResult=api.settlePlayerSeason(declining);
assert.ok(declineResult.change<0,"an unused veteran must decline at season settlement");
assert.ok(Object.values(declining.lastAttributeDevelopment.changes).some(change=>change<0),"season decline must record negative detailed-attribute changes");
assert.match(api.renderPlayerProfileModal(declining),/attribute-change down/,"negative development must render a down marker");

const unchanged=squad.find(player=>player!==growing&&player!==declining&&player.position!=="GK");
const unchangedBefore=api.playerAttributeSnapshot(unchanged);api.recordAttributeDevelopment(unchanged,unchangedBefore,{season:2026,reason:"赛季发展",overallChange:0});
assert.deepEqual(Object.keys(unchanged.lastAttributeDevelopment.changes),[],"unchanged attributes must not create markers");
assert.doesNotMatch(api.renderPlayerProfileModal(unchanged),/attribute-change (?:up|down)/,"unchanged attributes must render without change badges");

const legacy={...squad.find(player=>player.position==="GK"),development:{season:2026,startOverall:70,minutes:400,injuryDays:0}};
api.ensurePlayerDevelopment(legacy,2026);assert.deepEqual(legacy.development.startAttributes,api.playerAttributeSnapshot(legacy),"legacy saves must initialize the current attributes as their baseline");assert.equal(legacy.lastAttributeDevelopment,undefined,"legacy initialization must not invent historical growth");

const youthSystem=api.ensureYouthSystem(state),prospect={...api.createYouthProspect(state,club,2027,"attribute-growth"),status:"academy",age:16,trainingProgress:1.2};prospect.potential=Math.max(prospect.potential,prospect.overall+3);youthSystem.academy.prospects=[prospect];
api.advanceYouthDevelopment(state);assert.equal(prospect.lastAttributeDevelopment.reason,"青训成长");assert.ok(Object.keys(prospect.lastAttributeDevelopment.changes).length>0,"academy growth must record detailed changes");
const recordedYouthChanges={...prospect.lastAttributeDevelopment.changes};prospect.trainingProgress=1.2;api.advanceYouthDevelopment(state);assert.ok(prospect.lastAttributeDevelopment.overallChange>=2,"multiple academy growth ticks must accumulate in the same period");assert.notDeepEqual(prospect.lastAttributeDevelopment.changes,recordedYouthChanges,"accumulated academy changes must update after another growth tick");

prospect.age=17;const graduate=api.graduateYouthPlayer(state,youthSystem.academy,prospect,state.date);assert.deepEqual(graduate.lastAttributeDevelopment,prospect.lastAttributeDevelopment,"academy promotion must preserve the attribute-change record");
const transferSave={...state,squad:[]};api.addUserSquadSigning(transferSave,graduate,{date:state.date});assert.deepEqual(transferSave.squad[0].lastAttributeDevelopment,graduate.lastAttributeDevelopment,"a transferred player must retain the attribute-change record");

console.log("player attribute growth tests passed: season growth/decline, legacy baseline, youth accumulation and player moves");
