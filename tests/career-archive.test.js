"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[]},navigator:{},addEventListener:()=>{},__test:{}};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);

let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,createSquad,ensurePlayerDevelopment,playerCareerArchive,renderCareer,transferCareerSegment,settlePlayerSeason,setTestState:value=>{state=value;}});
})();
`);
vm.runInContext(source,context);

const api=context.__test;
const club=api.CLUBS.map(item=>({item,count:api.REAL_PLAYERS.filter(player=>player.club===item.id).length})).sort((a,b)=>b.count-a.count)[0].item;
const otherClub=api.CLUBS.find(item=>item.id!==club.id);
const sourcePlayer=api.REAL_PLAYERS.filter(player=>player.club===club.id).sort((a,b)=>b.overall-a.overall)[0];
const squad=api.createSquad(club,sourcePlayer),player=squad.find(item=>item.id==="controlled");
Object.assign(player,{appearances:10,goals:4,assists:5,ratingTotal:71,keyPasses:11,chancesCreated:7,successfulDribbles:13,progressivePasses:42,tackles:20,tacklesWon:14,interceptions:9,clearances:6,blocks:2,duels:38,duelsWon:23,recoveries:31,pressuresWon:12,saves:0,cleanSheets:0});
player.careerStats=[{id:"career-2025",season:2025,club:otherClub.name,clubId:otherClub.id,appearances:20,goals:6,assists:7,average:7.2,overallStart:76,overallEnd:78,keyPasses:18,chancesCreated:12,successfulDribbles:20,progressivePasses:61,tackles:28,tacklesWon:19,interceptions:14,clearances:8,blocks:3,duels:49,duelsWon:30,recoveries:44,pressuresWon:16,saves:0,cleanSheets:0}];
const transfer={id:"career-transfer-test",playerId:player.id,playerName:player.name,date:"2026-07-01",fromId:otherClub.id,toId:club.id,fee:42,reason:"常规转会"};
const save={version:29,role:"player",person:player.name,clubId:club.id,controlledId:player.id,squad,season:2026,date:"2026-10-01",played:10,wins:6,draws:2,losses:2,points:20,leaguePosition:3,history:[],transferHistory:[transfer],honors:[{name:"单场 MVP",season:2025,scope:"联赛"},{name:"单场 MVP",season:2025,scope:"杯赛"},{name:"单场 MVP",season:2026,scope:"欧冠"},{name:"联赛冠军",season:2025,scope:"俱乐部"},{name:"金球奖",season:2025,scope:"个人"},{name:"晋级世界杯正赛",season:2025,scope:"国家队"}],mvpCount:2};
api.setTestState(save);
api.ensurePlayerDevelopment(player,save.season);

const archive=api.playerCareerArchive(player);
assert.equal(archive.totals.appearances,30,"current and archived appearances must be combined");
assert.equal(archive.totals.goals,10);
assert.equal(archive.totals.assists,12);
assert.equal(archive.totals.keyPasses,29,"detailed creative statistics must be combined");
assert.equal(archive.totals.tacklesWon,33,"defensive statistics must be combined");
assert.equal(archive.mvpCount,3,"legacy MVP honor rows must repair a missing aggregate count");
assert.deepEqual(Array.from(archive.honors,honor=>honor.name),["联赛冠军","金球奖"],"only major honors should remain in the honor list");
assert.equal(archive.transfers.length,1,"the controlled player's transfer history must be shown");

const html=api.renderCareer();
assert.doesNotMatch(html,/生涯目标/,"career targets must be removed");
assert.match(html,/生涯出场[\s\S]*30/);
assert.match(html,/关键传球[\s\S]*29/);
assert.match(html,/成功抢断[\s\S]*33 \/ 48/);
assert.match(html,/单场 MVP[\s\S]*3/);
assert.doesNotMatch(html,/career-honor-row[\s\S]{0,300}单场 MVP/,"MVP matches must not be listed as individual honors");
assert.match(html,/金球奖/);
assert.match(html,/转会履历/);

const segment=api.transferCareerSegment(save,player,club,"2026-11-01",true);
assert.equal(segment.keyPasses,11,"mid-season transfers must preserve creative statistics");
assert.equal(segment.tacklesWon,14,"mid-season transfers must preserve defensive statistics");
assert.equal(segment.recoveries,31);

api.settlePlayerSeason(player);
const settled=player.careerStats.at(-1);
assert.equal(settled.clubId,club.id,"season records must retain the club identity");
assert.equal(settled.keyPasses,11,"season records must preserve creative statistics");
assert.equal(settled.tacklesWon,14,"season records must preserve defensive statistics");
assert.equal(settled.recoveries,31);

console.log("career archive tests passed: totals, major honors, MVP count, transfer history and detailed persistence");
