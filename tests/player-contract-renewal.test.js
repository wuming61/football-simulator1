"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const elements={app:{innerHTML:""},"toast-region":{appendChild:()=>{}},"busy-region":{setAttribute:()=>{},innerHTML:""}};
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:id=>elements[id]||null,querySelectorAll:()=>[],createElement:()=>({className:"",textContent:"",appendChild:()=>{},remove:()=>{}})},navigator:{},addEventListener:()=>{},__test:{}};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,createSquad,ensurePlayerContract,ensurePlayerCareer,evaluatePlayerRenewal,createRenewalNegotiation,acceptPlayerRenewal,submitPlayerRenewalCounter,renderModal,setTestState:value=>{state=value;},setModal:value=>{modal=value;}});
})();
`);vm.runInContext(source,context);
const api=context.__test,club=api.CLUBS.find(item=>item.prestige>=82),sourcePlayer=api.REAL_PLAYERS.filter(player=>player.club===club.id).sort((a,b)=>b.overall-a.overall)[0],squad=api.createSquad(club,sourcePlayer);squad.forEach(player=>api.ensurePlayerContract(player,2026));
const player=squad.find(item=>item.id==="controlled");player.contract.endSeason=2027;player.appearances=20;player.ratingTotal=140;player.goals=8;player.assists=7;player.development={...(player.development||{}),minutes:1500};
const state={version:33,role:"player",person:player.name,clubId:club.id,controlledId:player.id,squad,season:2026,date:"2026-10-01",view:"home",played:20,schedule:[],notifications:[],media:[],transferHistory:[],transferRequestsLog:[],transferNegotiations:[],playerCareer:null};api.setTestState(state);const career=api.ensurePlayerCareer(state);career.trust=82;career.professionalism=78;
const oldEnd=player.contract.endSeason,session=api.evaluatePlayerRenewal(state.date,true);assert.ok(session&&session.status==="active","strong expiring player should receive a formal offer");assert.equal(player.contract.endSeason,oldEnd,"an offer must not silently renew the contract");
api.setModal({type:"renewal",id:session.id});const html=api.renderModal();for(const id of ["renew-wage","renew-signing","renew-appearance","renew-release","renew-role","renew-years"])assert.match(html,new RegExp(`id="${id}"`),`${id} must be rendered`);
api.acceptPlayerRenewal(session.id);assert.equal(session.status,"completed");assert.ok(player.contract.endSeason>=2028);assert.equal(player.contract.weeklyWage,session.offer.weeklyWage);assert.equal(player.contract.signingBonus,session.offer.signingBonus);assert.equal(player.contract.appearanceFee,session.offer.appearanceFee);assert.equal(player.contract.releaseClause,session.offer.releaseClause);assert.equal(player.contract.role,session.offer.role);

career.renewalNegotiation=null;const second=api.createRenewalNegotiation("2027-01-01","agent");second.clubPatience=82;api.setModal({type:"renewal",id:second.id});elements["renew-wage"]={value:String(second.clubTarget.weeklyWage*4)};elements["renew-signing"]={value:String(second.clubTarget.signingBonus*6)};elements["renew-appearance"]={value:String(second.clubTarget.appearanceFee*4)};elements["renew-release"]={value:"1"};elements["renew-role"]={value:"核心主力"};elements["renew-years"]={value:"5"};api.submitPlayerRenewalCounter(second.id);assert.ok(second.clubPatience<82,"unreasonable counter must consume club patience");
console.log("player contract renewal tests passed");
