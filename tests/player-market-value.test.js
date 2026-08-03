"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[]},navigator:{},addEventListener:()=>{},__test:{}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,calculatePlayerMarketValue,initializePlayerMarketValue,quarterlyMarketValue,runQuarterlyMarketValueReview,currentPlayerMarketValue,transferFee,renderPlayerProfileModal,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,club=api.CLUBS[0],buyer=api.CLUBS[1];
const playedSchedule=Array.from({length:20},(_,index)=>({id:`played-${index}`,date:`2026-09-${String(index+1).padStart(2,"0")}`,status:"played",international:false}));
const player=(overrides={})=>({id:`test-${Math.random()}`,name:"Market Test",club:club.id,clubId:club.id,position:"CM",age:24,overall:78,potential:82,value:20,appearances:12,ratingTotal:12*6.8,goals:2,assists:3,injured:0,development:{season:2026,startOverall:78,minutes:900,injuryDays:0},fitness:90,morale:75,...overrides});
const calculationSave={clubId:club.id,season:2026,date:"2026-09-30",played:20,schedule:playedSchedule,squad:[]};

const lowerCa=player({overall:74,potential:82}),higherCa=player({overall:84,potential:84});
assert.ok(api.calculatePlayerMarketValue(higherCa,calculationSave)>api.calculatePlayerMarketValue(lowerCa,calculationSave),"higher current ability must produce a higher valuation");

const lowPotential=player({age:20,overall:76,potential:77}),highPotential=player({age:20,overall:76,potential:91});
assert.ok(api.calculatePlayerMarketValue(highPotential,calculationSave)>api.calculatePlayerMarketValue(lowPotential,calculationSave)*1.35,"young high-PA players must receive a material potential premium");

const prime=player({age:24,overall:82,potential:84}),veteran=player({age:34,overall:82,potential:84});
assert.ok(api.calculatePlayerMarketValue(prime,calculationSave)>api.calculatePlayerMarketValue(veteran,calculationSave)*2.5,"age must strongly discount an otherwise equal veteran");

const eliteSeason=player({appearances:20,ratingTotal:20*7.8,goals:10,assists:10}),poorSeason=player({appearances:7,ratingTotal:7*6.2,goals:0,assists:0});
assert.ok(api.calculatePlayerMarketValue(eliteSeason,calculationSave)>api.calculatePlayerMarketValue(poorSeason,calculationSave)*1.6,"rating, attendance, goals and assists must materially influence quarterly value");

const healthy=player(),longInjury=player({injured:45,development:{season:2026,startOverall:78,minutes:900,injuryDays:90}});
assert.ok(api.calculatePlayerMarketValue(healthy,calculationSave)>api.calculatePlayerMarketValue(longInjury,calculationSave),"long injuries must reduce valuation");

const quarterlyPlayer=player({id:"quarterly-player",overall:86,potential:91,value:10,appearances:20,ratingTotal:20*7.7,goals:8,assists:9});
const state={version:30,role:"coach",person:"Value Coach",clubId:club.id,squad:[quarterlyPlayer],season:2026,date:"2026-09-30",played:20,schedule:playedSchedule,notifications:[],media:[],transferHistory:[],transferRequestsLog:[],transferNegotiations:[],marketValuation:{lastQuarterKey:"2026-Q3",lastUpdatedDate:"2026-07-01"},worldMarketValues:{},transferMarket:{season:2026,records:[],rumors:[],clubOverrides:{},budgets:{},sequence:0}};
api.setTestState(state);api.initializePlayerMarketValue(quarterlyPlayer,state,state.date);
const beforeQuarter=quarterlyPlayer.value;
assert.equal(api.runQuarterlyMarketValueReview(state,"2026-09-30"),null,"market value must not update between quarterly review dates");
assert.equal(quarterlyPlayer.value,beforeQuarter,"performance changes must accumulate without changing the published value mid-quarter");
const review=api.runQuarterlyMarketValueReview(state,"2026-10-01");
assert.equal(review.type,"market-value");
assert.ok(quarterlyPlayer.value>beforeQuarter,"the quarterly review must publish the accumulated performance increase");
assert.ok(quarterlyPlayer.value<=beforeQuarter*1.42+.01,"one quarterly review must cap extreme upward jumps");
assert.equal(api.runQuarterlyMarketValueReview(state,"2026-10-01"),null,"the same quarterly review must never run twice");
assert.equal(quarterlyPlayer.marketValueState.lastUpdatedDate,"2026-10-01");
assert.equal(state.notifications[0].type,"transfer","the quarterly review must create a visible valuation notice");

const latestValue=quarterlyPlayer.value,fee=api.transferFee(quarterlyPlayer,buyer,club,4,state);
assert.ok(fee>=latestValue*.85,"transfer pricing must use the latest published market value");
const html=api.renderPlayerProfileModal(quarterlyPlayer);
assert.match(html,/身价 · 季度更新/);
assert.match(html,/market-value-change up/,"the player profile must show the current-season increase");
assert.match(html,/季度身价评估会同步反映变化/);

const legacy=player({id:"legacy-value",value:17});delete legacy.marketValueState;
api.initializePlayerMarketValue(legacy,{...state,squad:[legacy]},"2026-09-12");
assert.equal(legacy.value,17,"old saves must preserve their published value when the dynamic state is initialized");
assert.equal(legacy.marketValueState.seasonStartValue,17);

console.log("player market value tests passed: CA, PA, age, performance, injuries, quarterly timing, UI and transfers");
