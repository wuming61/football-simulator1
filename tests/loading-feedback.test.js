"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function classList() {
  const values=new Set();
  return {add:value=>values.add(value),remove:value=>values.delete(value),contains:value=>values.has(value)};
}

const progressStyle={value:null,setProperty:(name,value)=>{if(name==="--busy-progress")progressStyle.value=value;}};
const progressBar={style:progressStyle},percent={textContent:""},stage={textContent:""};
const busyRegion={innerHTML:"",attributes:{},classList:classList(),setAttribute(name,value){this.attributes[name]=value;},querySelector(selector){return ({".busy-progress-value":progressBar,".busy-percent":percent,".busy-stage":stage})[selector]||null;}};
const app={attributes:{},setAttribute(name,value){this.attributes[name]=value;},removeAttribute(name){delete this.attributes[name];}};
const body={classList:classList()};
const document={body,getElementById:id=>({app,"busy-region":busyRegion,"toast-region":{appendChild:()=>{}}})[id]||{},querySelectorAll:()=>[]};
const root=path.resolve(__dirname,"..");
const context={
  console,Intl,Date,Math,Promise,setTimeout,clearTimeout,setInterval,clearInterval,
  requestAnimationFrame:callback=>setTimeout(()=>callback(Date.now()),0),
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},document,navigator:{},addEventListener:()=>{},__test:{}
};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);

let source=fs.readFileSync(path.join(root,"app.js"),"utf8");
source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`
  Object.assign(window.__test,{showBusyTask,updateBusyProgress,hideBusyTask,runBusyTask});
})();
`);
vm.runInContext(source,context);

const api=context.__test;
assert.ok(api.runBusyTask,"test hooks failed to load");

module.exports=(async()=>{
  api.showBusyTask("正在模拟比赛","计算比赛数据",12);
  assert.equal(busyRegion.classList.contains("active"),true,"loading overlay must become visible immediately");
  assert.equal(busyRegion.attributes["aria-hidden"],"false");
  assert.equal(body.classList.contains("is-busy"),true,"background interactions must be blocked");
  assert.equal(app.attributes["aria-busy"],"true","app must expose its busy state to assistive technology");

  api.updateBusyProgress(64,"计算球员评分");
  assert.equal(progressStyle.value,"0.64");
  assert.equal(percent.textContent,"64%");
  assert.equal(stage.textContent,"计算球员评分");

  api.hideBusyTask();
  assert.equal(busyRegion.classList.contains("active"),false);
  assert.equal(body.classList.contains("is-busy"),false);
  assert.equal(app.attributes["aria-busy"],undefined);

  let runs=0;
  const first=api.runBusyTask({title:"任务一",detail:"处理中"},async ({progress,yieldFrame})=>{runs++;progress(55,"处理中");await yieldFrame();});
  const duplicate=api.runBusyTask({title:"任务二",detail:"不应执行"},async ()=>{runs++;});
  await Promise.all([first,duplicate]);
  assert.equal(runs,1,"repeated clicks must not start a second heavy task");
  assert.equal(busyRegion.classList.contains("active"),false,"loading overlay must always clear after completion");
  console.log("loading feedback tests passed: visibility, progress, cleanup and duplicate-click protection");
})();
