"use strict";

const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),local=new Map(),database=new Map(),toasts=[];
const localStorage={getItem:key=>local.has(key)?local.get(key):null,setItem(key,value){if(key.includes("save-slot")){const error=new Error("quota");error.name="QuotaExceededError";throw error;}local.set(key,String(value));},removeItem:key=>local.delete(key)};
const indexedDB={open(){
  const request={result:null};
  setTimeout(()=>{
    const db={
      objectStoreNames:{contains:()=>true},createObjectStore:()=>{},
      transaction(){
        const transaction={error:null,objectStore(){return {
          get(key){const result={result:null};setTimeout(()=>{result.result=database.get(key)||null;result.onsuccess?.();});return result;},
          put(value,key){setTimeout(()=>{database.set(key,value);transaction.oncomplete?.();});},
          delete(key){setTimeout(()=>{database.delete(key);transaction.oncomplete?.();});}
        };}};
        return transaction;
      }
    };
    request.result=db;request.onsuccess?.();
  });
  return request;
}};
const context={console,Intl,Date,Math,setTimeout,clearTimeout,setInterval,clearInterval,indexedDB,localStorage,document:{getElementById:id=>id==="toast-region"?{appendChild:element=>toasts.push(element.textContent)}:{},querySelectorAll:()=>[],createElement:()=>({className:"",textContent:"",remove:()=>{}}),body:{classList:{add:()=>{},remove:()=>{}}}},navigator:{},addEventListener:()=>{},__test:{}};context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,"data/dongqiudi-data.js"),"utf8"),context);
let source=fs.readFileSync(path.join(root,"app.js"),"utf8");source=source.replace(/\n  render\(\);\n\}\)\(\);\s*$/,`\n  Object.assign(window.__test,{saveState,loadSaveIndex,readIndexedSave,waitForIndexedSave,setTestState:value=>{state=value;},setActiveSave:value=>{activeSaveId=value;}});\n})();\n`);vm.runInContext(source,context);

(async()=>{
  const api=context.__test,save={version:44,role:"coach",person:"Large Career",clubId:"club",season:2026,date:"2026-12-13",played:18,squad:[],worldPlayerStats:{season:2026,players:{},archives:{},processedMatches:{}}};
  api.setTestState(save);api.setActiveSave("large-career");assert.doesNotThrow(()=>api.saveState());await api.waitForIndexedSave("large-career");
  assert.equal(localStorage.getItem("football-simulator-save-slot-large-career"),null,"oversized local copy must be removed");
  assert.deepEqual(JSON.parse(await api.readIndexedSave("large-career")),save,"full save must persist in IndexedDB");
  const metadata=api.loadSaveIndex().find(item=>item.id==="large-career");assert.equal(metadata.backend,"indexeddb","save index must retain the large-capacity backend");
  assert.equal(toasts.length,0,"successful migration must not show a storage failure");
  console.log("indexed save migration tests passed: quota overflow, durable write and indexed metadata");
})().catch(error=>{console.error(error);process.exitCode=1;});
