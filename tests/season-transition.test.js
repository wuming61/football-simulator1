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
  Object.assign(window.__test,{seasonScheduleComplete,continueActionMode});
})();
`);
vm.runInContext(source,context);

const api=context.__test,played={id:"played",date:"2027-05-23",status:"played"},future={id:"future",date:"2027-05-23",status:"upcoming"};
assert.equal(api.continueActionMode({date:"2027-05-01",schedule:[future],retired:false}),"advance","a future fixture must keep normal time advancement");
assert.equal(api.continueActionMode({date:"2027-05-23",schedule:[future],retired:false}),"match","a due fixture must open the match");
assert.equal(api.seasonScheduleComplete({schedule:[played]}),true,"a played-only schedule must be recognized as complete");
assert.equal(api.continueActionMode({date:"2027-05-24",schedule:[played],retired:false}),"season","a completed schedule must route Continue to season settlement");
assert.equal(api.continueActionMode({date:"2027-05-24",schedule:[],retired:false}),"disabled","an empty or broken schedule must not settle repeatedly");
assert.equal(api.continueActionMode({date:"2027-05-24",schedule:[played],retired:true}),"disabled","retired careers must remain closed");
assert.match(source,/if\(mode==="season"\)\{newSeason\(\);return;\}/,"the Continue action must call the existing new-season settlement path");
assert.match(source,/seasonReady\?"新赛季"/,"the top Continue control must visibly switch to the new-season state");
assert.match(source,/seasonReady\?"开始新赛季"/,"the player home action must visibly switch to the new-season state");
assert.match(source,/continueMode==="disabled"\?"disabled":""/,"the top Continue control must only disable genuinely unavailable actions, not a completed season");

console.log("season transition tests passed: advance, match, completed season and retired states");
