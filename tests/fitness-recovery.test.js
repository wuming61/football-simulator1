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
  Object.assign(window.__test,{recoverFitness});
})();
`);
vm.runInContext(source,context);

const {recoverFitness}=context.__test,player={age:26,fitness:68,injured:0};
assert.equal(recoverFitness(player,6,"balanced"),90,"six balanced recovery days should restore a heavily used player to match-ready condition");
assert.equal(recoverFitness(player,4,"recovery"),89,"a recovery-focused plan should provide a meaningful short-term advantage");
assert.equal(recoverFitness(player,4,"intense"),80,"intense training should still slow recovery");
assert.ok(recoverFitness({...player,age:35},4,"balanced")<recoverFitness(player,4,"balanced"),"older players should recover more slowly");
assert.ok(recoverFitness({...player,injured:4},4,"balanced")<recoverFitness(player,4,"balanced"),"injuries should continue to limit recovery");
assert.equal(recoverFitness({...player,fitness:94},4,"balanced"),99,"recovery near full fitness should continue to taper instead of instantly reaching 100");

console.log("fitness recovery tests passed: balanced, recovery, intense, age and injury modifiers");
