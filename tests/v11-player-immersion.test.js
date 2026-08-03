"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root=path.resolve(__dirname,".."),storage=new Map();
const localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage,document:{getElementById:id=>id==="toast-region"?{appendChild:()=>{}}:{},querySelectorAll:()=>[],createElement:()=>({className:"",innerHTML:"",remove:()=>{}})},navigator:{},addEventListener:()=>{},confirm:()=>true,__test:{}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace("  function render() {\n","  function render() { return; }\n  function renderDisabled() {\n");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,PLAYER_MATCH_PLANS,createSquad,ensurePlayerContract,ensurePlayerCareer,loadSaveIndex,saveState,startConversation,chooseConversation,effectiveMatchAttribute,weightedPlayerPlanFactor,renderMainMenu,renderPlayerHome,setTestState:value=>{state=value;},setActiveSave:value=>{activeSaveId=value;},getCareer:()=>ensurePlayerCareer(),getConversation:()=>conversationSession});
})();
`);
vm.runInContext(source,context);
const api=context.__test,club=api.CLUBS[0],squad=api.createSquad(club,null),controlled=squad.find(player=>player.position!=="GK");
controlled.id="controlled";squad.forEach(player=>api.ensurePlayerContract(player,2026));
const fixture={id:"v11-fixture",date:"2026-08-08",competition:"英超",round:"第 1 轮",opponent:api.CLUBS[1].name,home:true,status:"upcoming"};
const state={version:27,role:"player",person:controlled.name,clubId:club.id,controlledId:"controlled",squad,season:2026,date:"2026-08-03",played:0,leaguePosition:1,schedule:[fixture],playerCareer:null,activeMatch:null};
api.setTestState(state);api.setActiveSave("slot-a");api.saveState();
state.person="Independent Career";api.setActiveSave("slot-b");api.saveState();
assert.equal(api.loadSaveIndex().length,2,"multiple save slots must remain indexed");
assert.notEqual(storage.get("football-simulator-save-slot-slot-a"),storage.get("football-simulator-save-slot-slot-b"),"save slots must remain independent");
assert.match(api.renderMainMenu(),/2 个生涯/,"main menu must expose all indexed saves");
assert.match(api.renderPlayerHome(),/亲朋好友/,"player home must expose immersive relationship contacts");
assert.match(api.renderPlayerHome(),/倾尽全力/,"player home must expose expanded pre-match approaches");

state.person=controlled.name;api.startConversation("coach");
assert.equal(api.getConversation().stage,0,"conversation must open before applying effects");
api.chooseConversation("tactics");
assert.equal(api.getConversation().stage,1,"conversation must require a follow-up choice");
assert.equal(api.getCareer().conversationHistory.length,0,"unfinished conversations must not apply permanent effects");
api.chooseConversation("clarify");
assert.equal(api.getConversation(),null,"second response must close the conversation");
assert.equal(api.getCareer().conversationHistory.length,1,"completed transcript must be persisted");
assert.ok(api.getCareer().tactical>62,"coach tactical conversation must improve tactical understanding");

const career=api.getCareer(),match={minute:35,substitutions:[],controlledMatchPlan:"balanced",playerPlanMinutes:{conserve:30,allout:5}};
career.confidence=60;career.tactical=60;career.chemistry=60;career.pressure=35;
const basePassing=api.effectiveMatchAttribute(controlled,"passing",match,"ours");career.chemistry=90;career.pressure=15;
assert.ok(api.effectiveMatchAttribute(controlled,"passing",match,"ours")>basePassing+1,"chemistry and pressure must materially affect performance");
assert.ok(api.weightedPlayerPlanFactor(match,"fatigue")<0.85,"executed plan minutes must drive final fatigue weighting");
assert.ok(api.PLAYER_MATCH_PLANS.allout.injuryRisk>api.PLAYER_MATCH_PLANS.safe.injuryRisk,"all-out play must carry more injury risk than avoiding injury");

console.log("V1.1 immersion tests passed: multi-save, multi-turn dialogue, chemistry, pressure and live plans");
