"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),elements={app:{innerHTML:""},"toast-region":{appendChild:()=>{}},"busy-region":{setAttribute:()=>{},innerHTML:""}};
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],createElement:()=>({className:"",textContent:"",appendChild:()=>{},remove:()=>{}})},navigator:{},addEventListener:()=>{},__test:{}};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,
`\n  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,createSquad,ensurePlayerContract,ensurePlayerCareer,createTransferMarket,createAiTransferRuntimeCache,playerTransferRequestChance,createPlayerTransferRequestOffer,completeControlledPlayerTransfer,rejectPlayerTransferOffer,completeTransfer,renderModal,setTestState:value=>{state=value;},setModal:value=>{modal=value;},setCache:value=>{aiTransferRuntimeCache=value;}});\n})();\n`);
vm.runInContext(source,context);

const api=context.__test;
const seller=api.CLUBS.filter(club=>club.prestige>=70&&club.prestige<=80).sort((a,b)=>a.prestige-b.prestige)[0];
const sourcePlayer=api.REAL_PLAYERS.filter(player=>player.club===seller.id).sort((a,b)=>b.overall-a.overall)[0];
const squad=api.createSquad(seller,sourcePlayer);squad.forEach(player=>api.ensurePlayerContract(player,2026));
const player=squad.find(item=>item.id==="controlled");Object.assign(player,{overall:Math.max(player.overall,78),potential:90,appearances:19,ratingTotal:136.8,goals:8,assists:7,value:32,development:{...(player.development||{}),minutes:1550}});player.contract.endSeason=2027;
const state={version:35,role:"player",person:player.name,clubId:seller.id,controlledId:"controlled",squad,season:2026,date:"2026-08-03",view:"transfers",played:19,schedule:[],notifications:[],media:[],transferHistory:[],transferRequestsLog:[],transferNegotiations:[],funds:100,transferMarket:api.createTransferMarket(2026)};
Object.keys(state.transferMarket.budgets).forEach(id=>{state.transferMarket.budgets[id]=9999;});api.setTestState(state);

const chance=api.playerTransferRequestChance(state,player);assert.ok(chance>=70&&chance<=96,"submitted player request chance must be prominently high");
player.transferRequestStatus="submitted";const career=api.ensurePlayerCareer(state);api.setCache(api.createAiTransferRuntimeCache(state,state.date));const offer=api.createPlayerTransferRequestOffer(state,state.date);api.setCache(null);
assert.ok(offer,"submitted request should yield a formal market offer when an eligible buyer has budget");assert.equal(player.transferRequestStatus,"offer-received");
for(const key of ["weeklyWage","signingBonus","appearanceFee","releaseClause","role","years"])assert.ok(offer.contract[key]!==undefined,`offer must contain ${key}`);assert.ok(offer.deadlineDate>state.date,"offer must have a response deadline");
api.setModal({type:"playerTransferOffer",id:offer.id});const modalHtml=api.renderModal();for(const text of ["周薪","签约奖金","出场津贴","解约金","队内角色","合同年限","接受并转会","拒绝报价"])assert.match(modalHtml,new RegExp(text),`modal should display ${text}`);

api.rejectPlayerTransferOffer(offer.id);assert.equal(player.transferRequestStatus,"submitted","rejecting must keep the transfer request active");assert.equal(career.transferOfferHistory[0].status,"rejected");
api.setCache(api.createAiTransferRuntimeCache(state,state.date));const acceptedOffer=api.createPlayerTransferRequestOffer(state,state.date);api.setCache(null);assert.ok(acceptedOffer,"rejected buyer should not prevent the market from finding another buyer");
player.appearances=21;player.goals=9;player.assists=8;player.keyPasses=31;const formerClub=state.clubId;assert.equal(api.completeControlledPlayerTransfer(acceptedOffer),true,"controlled player must transfer only after explicit acceptance");
const moved=state.squad.find(item=>item.id==="controlled");assert.equal(state.clubId,acceptedOffer.toId);assert.equal(moved.club,acceptedOffer.toId);assert.equal(moved.contract.weeklyWage,acceptedOffer.contract.weeklyWage);assert.equal(moved.appearances,21,"mid-season transfer must preserve cumulative season appearances");assert.equal(moved.goals,9);assert.equal(moved.assists,8);assert.equal(moved.keyPasses,31,"detailed season data must survive the club switch");assert.ok(moved.careerStats.some(row=>row.clubId===formerClub&&row.appearances===21&&row.goals===9&&row.assists===8),"old club segment must be retained");assert.ok(state.transferHistory.some(row=>row.id&&row.fromId===formerClub&&row.toId===acceptedOffer.toId),"accepted transfer must enter permanent history");

const protectedRumor={id:"illegal-controlled-sale",status:"active",playerId:moved.id,playerName:moved.name,position:moved.position,overall:moved.overall,potential:moved.potential,fromId:state.clubId,toId:formerClub,fee:1,confidence:100,windowKey:"summer-2026"};assert.equal(api.completeTransfer(state,protectedRumor,state.date,true),false,"AI transfer completion must not auto-sell the controlled player");
console.log("player transfer request tests passed");
