"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[]},navigator:{},addEventListener:()=>{},__test:{}};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,createSquad,ensurePlayerContract,ensurePlayerDevelopment,dynamicPotentialAssessment,settlePlayerSeason,renderPlayerProfileModal,createYouthProspect,setTestState:value=>{state=value;}});
})();
`);vm.runInContext(source,context);
const api=context.__test,club=api.CLUBS[0],squad=api.createSquad(club,null);squad.forEach(player=>api.ensurePlayerContract(player,2026));
const state={version:34,role:"coach",person:"Potential Coach",clubId:club.id,squad,season:2026,date:"2027-05-30",view:"squad",training:"intense",played:34,schedule:[],notifications:[],media:[],honors:[],history:[],transferHistory:[],transferRequestsLog:[],transferNegotiations:[]};api.setTestState(state);

const breakout=squad.find(player=>player.position!=="GK");breakout.age=20;breakout.overall=80;breakout.potential=80;breakout.appearances=34;breakout.ratingTotal=34*7.8;breakout.goals=8;breakout.assists=9;const development=api.ensurePlayerDevelopment(breakout,2026);development.startOverall=80;development.startPotential=80;development.minutes=2750;development.trainingScore=70;
const settlement=api.settlePlayerSeason(breakout);assert.equal(settlement.potentialResult.change,2,"elite young season must raise a reached potential ceiling");assert.equal(breakout.potential,82);assert.ok(breakout.overall>80,"new potential space must allow CA to continue growing in the same settlement");assert.equal(breakout.potentialHistory.length,1);
const repeated=api.dynamicPotentialAssessment(breakout,state);assert.equal(repeated.change,0,"potential must be assessed only once per season");assert.equal(breakout.potential,82);

state.season=2027;breakout.age=21;breakout.appearances=35;breakout.ratingTotal=35*7.85;const nextDevelopment=api.ensurePlayerDevelopment(breakout,2027);nextDevelopment.minutes=2850;nextDevelopment.trainingScore=72;const next=api.dynamicPotentialAssessment(breakout,state);assert.equal(next.change,2,"sustained elite development may continue raising potential in a later season");assert.equal(breakout.potential,84);

const stalled=squad.find(player=>player!==breakout&&player.position!=="GK");stalled.age=28;stalled.overall=76;stalled.potential=84;stalled.appearances=1;stalled.ratingTotal=5.8;const stalledDevelopment=api.ensurePlayerDevelopment(stalled,2027);stalledDevelopment.minutes=80;stalledDevelopment.injuryDays=145;stalledDevelopment.trainingScore=0;const decline=api.dynamicPotentialAssessment(stalled,state);assert.equal(decline.change,-1,"long inactivity and serious injury may lower unrealized potential");assert.equal(stalled.potential,83);assert.ok(stalled.potential>=stalled.overall,"potential must never fall below CA");

const academy=api.createYouthProspect(state,club,2028,"dynamic-pa");academy.status="academy";academy.age=16;academy.potentialAssessmentSeason=null;academy.mentorshipDays=210;academy.trainingProgress=.8;const youth=api.dynamicPotentialAssessment(academy,state,{academy:true,facilities:5,mentorDays:academy.mentorshipDays});assert.equal(youth.change,1,"elite facilities and sustained mentoring may raise academy potential");

const html=api.renderPlayerProfileModal(breakout);assert.match(html,/动态潜力/);assert.match(html,/potential-change up/);assert.match(html,/↑2/);
console.log("dynamic potential tests passed: repeatable upside, downside, academy and profile markers");
