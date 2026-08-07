"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document:{getElementById:()=>({}),querySelectorAll:()=>[],createElement:()=>({})},navigator:{},addEventListener:()=>{},__test:{}};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`\n  Object.assign(window.__test,{CLUBS,REAL_PLAYERS,createSquad,createMajorLeagueWorld,createTransferMarket,simulateMajorLeagueWorld,ensureWorldPlayerStats,aiClubPlayers,completeTransfer,playerProfileData,setTestState:value=>{state=value;}});\n})();\n`);vm.runInContext(source,context);

const api=context.__test,userClub=api.CLUBS.find(club=>club.league==="ENG1"),aiClub=api.CLUBS.find(club=>club.league==="ESP1"&&api.REAL_PLAYERS.some(player=>player.club===club.id)),buyer=api.CLUBS.find(club=>club.id!==aiClub.id&&club.id!==userClub.id&&api.REAL_PLAYERS.some(player=>player.club===club.id));
const save={version:43,role:"coach",person:"World Test",clubId:userClub.id,controlledId:null,squad:api.createSquad(userClub),season:2026,date:"2026-08-01",schedule:[],played:0,notifications:[],media:[],transferHistory:[],transferRequestsLog:[],transferNegotiations:[],funds:500,transferMarket:api.createTransferMarket(2026),majorLeagueWorld:api.createMajorLeagueWorld(2026,userClub.id),worldPlayerStats:{season:2026,players:{},archives:{},processedMatches:{}}};Object.keys(save.transferMarket.budgets).forEach(id=>save.transferMarket.budgets[id]=9999);api.setTestState(save);

api.simulateMajorLeagueWorld(save,"2026-10-01");
const world=api.ensureWorldPlayerStats(save),aiRoster=api.aiClubPlayers(save,aiClub.id),tracked=aiRoster.filter(player=>player.appearances>0);
assert.ok(Object.keys(world.players).length>100,"AI league rounds must persist player-level data across the football world");
assert.ok(tracked.length>=15,"AI clubs must rotate starters and substitutes rather than track only scorers");
assert.ok(tracked.every(player=>player.ratingTotal>0&&player.appearances>0),"AI appearances must carry real rating totals");
assert.ok(tracked.some(player=>player.goals>0||player.assists>0),"AI attacking contributions must be simulated");
assert.ok(tracked.some(player=>player.tackles>0||player.keyPasses>0),"AI detailed performance data must be simulated");

const transferPlayer=[...tracked].sort((a,b)=>b.appearances-a.appearances)[0],before={appearances:transferPlayer.appearances,goals:transferPlayer.goals,assists:transferPlayer.assists,ratingTotal:transferPlayer.ratingTotal};
const rumor={id:"world-stat-transfer",status:"active",season:2026,windowKey:"summer-2026",createdDate:"2026-10-01",resolveDate:"2026-10-01",playerId:transferPlayer.id,playerName:transferPlayer.name,position:transferPlayer.position,overall:transferPlayer.overall,potential:transferPlayer.potential,fromId:aiClub.id,toId:buyer.id,fee:20,confidence:100,reason:"阵容补强"};
assert.equal(api.completeTransfer(save,rumor,"2026-10-01",true),true,"tracked AI player transfer should complete");
const after=api.aiClubPlayers(save,buyer.id).find(player=>player.id===transferPlayer.id),record=save.transferHistory.find(item=>item.playerId===transferPlayer.id);
assert.ok(after,"transferred AI player must appear in the destination roster");
assert.deepEqual({appearances:after.appearances,goals:after.goals,assists:after.assists,ratingTotal:after.ratingTotal},before,"all current-season totals must follow an AI player to the new club");
assert.equal(record.careerSegment.dataUnavailable,false,"AI origin-club segment must contain tracked data");
assert.equal(record.careerSegment.appearances,before.appearances,"origin-club appearances must be archived at transfer time");
const profile=api.playerProfileData(after);assert.equal(profile.appearances,before.appearances,"player profile must hydrate preserved world statistics after transfer");

console.log("world player stats tests passed: AI simulation, rotation, detailed data and transfer continuity");
