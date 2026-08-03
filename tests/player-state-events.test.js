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
  Object.assign(window.__test,{CLUBS,PLAYER_STATE_EVENTS,createSquad,ensurePlayerContract,ensurePlayerCareer,eligiblePlayerStateEvents,startPlayerStateEvent,startPlayerStory,playerStoryChoices,resolvePlayerStoryChoice,grantPerformanceResponse,settlePerformanceResponse,effectiveMatchAttribute,renderPlayerCareerModal,setTestState:value=>{state=value;},setModal:value=>{modal=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS[0],squad=api.createSquad(club,null),controlled=squad.find(player=>player.position!=="GK");controlled.id="controlled";squad.forEach(player=>api.ensurePlayerContract(player,2026));
const fixture={id:"state-event-fixture",date:"2026-08-10",competition:"欧冠",round:"决赛",phase:"knockout",opponent:api.CLUBS[1].name,home:true,status:"upcoming"};
const state={version:29,role:"player",person:controlled.name,clubId:club.id,controlledId:controlled.id,squad,season:2026,date:"2026-08-03",schedule:[fixture],played:0,leaguePosition:1,playerCareer:null,notifications:[],media:[],honors:[],history:[],transferHistory:[]};api.setTestState(state);
const career=api.ensurePlayerCareer();career.trust=70;career.tactical=72;career.chemistry=72;career.pressure=45;career.relationships.fans=70;career.benchStreak=1;controlled.fitness=80;controlled.morale=74;controlled.lastRating=7.4;

assert.equal(api.PLAYER_STATE_EVENTS.length,12,"the career must provide twelve distinct temporary-state event types");
assert.ok(api.PLAYER_STATE_EVENTS.every(event=>event.choices.length===3),"every temporary-state event must offer three meaningful choices");
assert.equal(new Set(api.PLAYER_STATE_EVENTS.map(event=>event.id)).size,12,"temporary-state event ids must be unique");
const eligibleIds=api.eligiblePlayerStateEvents().map(event=>event.id);
for(const expected of ["training-flow","analyst-report","coach-detail","teammate-sync","captain-rally","family-reset","supporters-energy","media-momentum","recovery-breakthrough","bench-spark","big-match-clarity"])assert.ok(eligibleIds.includes(expected),`${expected} must react to the prepared match context`);
assert.ok(!eligibleIds.includes("keeper-clinic"),"outfield players must not receive goalkeeper-only events");

const basePassing=controlled.passing,baseOverall=controlled.overall,story=api.startPlayerStateEvent(state.date,"analyst-report");
assert.equal(story.type,"state-boost");assert.equal(api.playerStoryChoices(story).length,3);api.setModal({type:"playerStory"});
assert.match(api.renderPlayerCareerModal(),/临时状态事件/);assert.match(api.renderPlayerCareerModal(),/有效出场次数后结束/);assert.match(api.renderPlayerCareerModal(),/传球 \+4 · 盘带 \+1 · 持续 2 场/);
const match={minute:0,substitutions:[],controlledMatchPlan:"balanced",lineupIds:[controlled.id]};
const beforeBoost=api.effectiveMatchAttribute(controlled,"passing",match,"ours");api.resolvePlayerStoryChoice("analyst-space");
assert.equal(career.story,null,"temporary-state events must complete immediately after the player chooses");
assert.equal(career.temporaryAttributeBoosts.passing,4);assert.equal(career.temporaryBoostMatches,2);assert.equal(career.responseMatches,2);api.grantPerformanceResponse("review",{boosts:{passing:3,defending:2},matches:3,source:"叠加测试：录像复盘"});
assert.equal(career.temporaryBuffs.length,2,"positive temporary buffs from different events must coexist");assert.equal(career.temporaryAttributeBoosts.passing,7,"same-attribute positive buffs must add together");assert.equal(career.temporaryAttributeBoosts.defending,2);assert.equal(career.temporaryBoostMatches,3);assert.match(career.temporaryBoostSource,/2 项正面状态叠加/);
assert.ok(api.effectiveMatchAttribute(controlled,"passing",match,"ours")>=beforeBoost+7,"the stacked detailed boost must feed the match engine");
assert.equal(controlled.passing,basePassing,"temporary events must not alter the permanent detailed attribute");assert.equal(controlled.overall,baseOverall,"temporary events must not alter permanent overall ability");
assert.equal(career.storyHistory[0].eventId,"analyst-report");assert.equal(career.storyHistory[0].boosts.passing,4);assert.equal(career.storyHistory[0].boosts.dribbling,1);
api.settlePerformanceResponse(career,6.8,12);assert.equal(career.temporaryBoostMatches,3,"short cameos must not consume stacked temporary buffs");api.settlePerformanceResponse(career,6.8,65);api.settlePerformanceResponse(career,6.9,70);assert.equal(career.temporaryBuffs.length,1,"the shorter buff must expire independently");assert.equal(career.temporaryAttributeBoosts.passing,3,"the longer buff must remain after the shorter one expires");api.settlePerformanceResponse(career,6.9,70);assert.equal(career.temporaryBoostMatches,0);assert.deepEqual(Object.keys(career.temporaryAttributeBoosts),[],"all temporary buffs must expire after their own promised appearances");
api.grantPerformanceResponse("conversation",{boosts:{passing:7},matches:1,source:"上限测试 A"});api.grantPerformanceResponse("conversation",{boosts:{passing:6},matches:1,source:"上限测试 B"});assert.equal(career.temporaryAttributeBoosts.passing,10,"stacked temporary attributes must respect the +10 realism cap");api.settlePerformanceResponse(career,6.8,60);assert.equal(career.temporaryBoostMatches,0);

career.story=null;career.benchStreak=0;controlled.lastRating=6.7;controlled.fitness=92;controlled.morale=88;career.pressure=24;career.trust=70;controlled.contract.endSeason=2029;let contextualStory=null;for(let offset=0;offset<20&&!contextualStory;offset++){career.story=null;const date=new Date(Date.UTC(2026,7,20+offset)).toISOString().slice(0,10);api.startPlayerStory(date);if(career.story?.type==="state-boost")contextualStory=career.story;}assert.ok(contextualStory,"stable careers must receive contextual positive-state events while retaining some existing competition stories");
career.story=null;controlled.lastRating=5.9;api.startPlayerStory("2026-09-01");assert.equal(career.story.type,"form","poor form must still prioritize the existing recovery storyline");

const goalkeeper=squad.find(player=>player.position==="GK");state.controlledId=goalkeeper.id;state.person=goalkeeper.name;state.playerCareer=null;goalkeeper.fitness=90;const keeperCareer=api.ensurePlayerCareer(),keeperEligible=api.eligiblePlayerStateEvents(keeperCareer,goalkeeper).map(event=>event.id);assert.ok(keeperEligible.includes("keeper-clinic"));assert.ok(!keeperEligible.includes("training-flow"));
const keeperStory=api.startPlayerStateEvent(state.date,"keeper-clinic");api.resolvePlayerStoryChoice("keeper-reactions");assert.equal(keeperCareer.temporaryAttributeBoosts.goalkeeping,4,"goalkeepers need a position-specific temporary boost path");
const legacySave={...state,controlledId:controlled.id,playerCareer:{temporaryAttributeBoosts:{passing:3,defending:2},temporaryBoostMatches:2,temporaryBoostSource:"旧存档恢复"}},migratedCareer=api.ensurePlayerCareer(legacySave);assert.equal(migratedCareer.temporaryBuffs.length,1,"legacy flat boosts must migrate into a buff instance");assert.equal(migratedCareer.temporaryBuffs[0].remainingMatches,2);assert.equal(migratedCareer.temporaryAttributeBoosts.passing,3);

console.log(`player state event tests passed: ${api.PLAYER_STATE_EVENTS.length} event types, contextual eligibility, match boosts and expiry`);
