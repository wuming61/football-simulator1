"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

let randomSeed=246813579;const seededMath=Object.create(Math);seededMath.random=()=>{randomSeed=(randomSeed*1664525+1013904223)>>>0;return randomSeed/4294967296;};
const root=path.resolve(__dirname,"..");
const context={console,Intl,Date,Math:seededMath,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[]},navigator:{},addEventListener:()=>{},__test:{}};
context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{APP_VERSION,CLUBS,createSquad,ensurePlayerContract,seasonBroadcastRevenue,seasonFinancePlans,ownerInvestmentFor,createTransferMarket,ensureClubFinances,runMonthlyClubFinances,activateSeasonFinances,simulateTransferMarket,renderTransfers,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test,england=api.CLUBS.filter(club=>club.league==="ENG1"),club=england[0]||api.CLUBS[0],participants=Math.max(20,england.length);
assert.equal(api.APP_VERSION,"V1.5");
assert.ok(api.seasonBroadcastRevenue(club,participants,participants)>=118,"every Premier League club must receive at least the £100m-equivalent base distribution");
assert.ok(api.seasonBroadcastRevenue(club,1,participants)>api.seasonBroadcastRevenue(club,participants,participants),"a higher league finish must increase broadcast prize money");

const squad=api.createSquad(club,null);squad.forEach(player=>api.ensurePlayerContract(player,2026));
const save={version:32,role:"coach",person:"Finance Test",clubId:club.id,controlledId:null,squad,season:2026,date:"2026-08-31",played:0,funds:Number(club.budget)||50,media:[],notifications:[],transferHistory:[],transferRequestsLog:[],transferNegotiations:[],schedule:[],majorLeagueWorld:{leagues:{}},leaguePosition:1,transferMarket:api.createTransferMarket(2026),worldMarketValues:{},marketValuation:{lastQuarterKey:"2026-Q3",lastUpdatedDate:"2026-07-01"}};
api.setTestState(save);const finance=api.ensureClubFinances(save);finance.lastOperatingMonth="2026-08";
const fundsBefore=save.funds,aiClub=api.CLUBS.find(item=>item.id!==club.id),aiBefore=save.transferMarket.budgets[aiClub.id];
const monthlyEvent=api.runMonthlyClubFinances(save,"2026-09-01");
assert.equal(monthlyEvent.type,"finance","a quarterly operating report must be a visible calendar event");
assert.ok(save.funds>fundsBefore,"tickets, shirts and commercial operations must add to the user's transfer budget");
const monthlyIncrease=save.funds-fundsBefore;
assert.ok(save.transferMarket.budgets[aiClub.id]>aiBefore,"the same operating income model must replenish AI club budgets");
assert.ok(finance.ledger.some(entry=>entry.type==="operations"&&entry.matchday>0&&entry.commercial>0),"the finance ledger must retain matchday and retail income separately");
const onceOnly=save.funds;assert.equal(api.runMonthlyClubFinances(save,"2026-09-01"),null);assert.equal(save.funds,onceOnly,"monthly income must never be credited twice");

const positions=Object.fromEntries(api.CLUBS.map((item,index)=>[item.id,index%Math.max(2,api.CLUBS.filter(other=>other.league===item.league).length)+1])),plans=api.seasonFinancePlans(save,2027,positions);
assert.equal(Object.keys(plans.budgets).length,api.CLUBS.length,"every club must receive a new-season transfer budget");
assert.ok(Object.values(plans.budgets).every(value=>Number(value)>=6),"no club may enter a new season without transfer funds");
assert.ok(plans.reports[club.id].broadcast>=118,"the user's Premier League season report must preserve the broadcast floor");
save.season=2027;save.date="2027-06-15";save.transferMarket=api.createTransferMarket(2027,plans.budgets);save.funds=plans.budgets[club.id];const seasonReport=api.activateSeasonFinances(save,plans,save.date);
assert.equal(save.transferMarket.budgets[club.id],seasonReport.transferBudget);assert.ok(finance.ledger.some(entry=>entry.type==="season"&&entry.season===2027),"new-season allocations must be visible in the finance ledger");

let foundOwnerInvestment=false;for(let season=2027;season<=2040&&!foundOwnerInvestment;season++)for(const item of api.CLUBS){if(api.ownerInvestmentFor(item,season,"season",0)>0){foundOwnerInvestment=true;break;}}
assert.equal(foundOwnerInvestment,true,"owner injections must be possible events rather than unreachable copy");

save.view="transfers";save.transferNegotiations=[];save.transferRequestsLog=[];save.transferHistory=[];const financeHtml=api.renderTransfers();
assert.match(financeHtml,/俱乐部财政与预算来源/);assert.match(financeHtml,/转播 · 比赛日 · 商业 · 注资/);assert.match(financeHtml,/进入转会预算/);

const marketSave={...save,season:2026,date:"2026-08-01",role:"coach",media:[],notifications:[],transferHistory:[],squad:squad.map(player=>({...player})),transferMarket:api.createTransferMarket(2026)};Object.keys(marketSave.transferMarket.budgets).forEach(id=>{marketSave.transferMarket.budgets[id]=Math.max(80,marketSave.transferMarket.budgets[id]);});
api.simulateTransferMarket(marketSave,"2026-09-01");
const rumorStatuses=marketSave.transferMarket.rumors.reduce((counts,rumor)=>({...counts,[rumor.status]:(counts[rumor.status]||0)+1}),{});
assert.ok(marketSave.transferMarket.records.length>=8,`an active summer window must produce a healthy number of completed AI transfers, received ${marketSave.transferMarket.records.length}; rumors ${JSON.stringify(rumorStatuses)}`);

console.log(`club finance tests passed: broadcast ${plans.reports[club.id].broadcast}, monthly +${monthlyIncrease.toFixed(1)}, summer transfers ${marketSave.transferMarket.records.length}`);
