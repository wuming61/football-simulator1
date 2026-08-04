"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const css=fs.readFileSync(path.resolve(__dirname,"..","styles.css"),"utf8");

assert.match(css,/\.main\s*\{[^}]*padding-top:\s*68px/s,"desktop content must start below the fixed topbar");
assert.match(css,/\.topbar\s*\{[^}]*position:\s*fixed[^}]*top:\s*0[^}]*right:\s*0[^}]*left:\s*var\(--sidebar\)[^}]*z-index:\s*30/s,"desktop topbar must remain fixed beside the sidebar");
assert.match(css,/@media\s*\(max-width:\s*760px\)[\s\S]*?\.main\s*\{[^}]*padding-top:\s*60px[^}]*\}[\s\S]*?\.topbar\s*\{[^}]*left:\s*0[^}]*height:\s*60px/s,"mobile content and topbar must use the compact fixed-header dimensions");
assert.match(css,/\.modal-backdrop\s*\{[^}]*z-index:\s*50/s,"modals must remain above the fixed topbar");
assert.match(css,/\.busy-region\s*\{[^}]*z-index:\s*140/s,"loading feedback must remain above the fixed topbar");

console.log("fixed topbar tests passed: desktop, mobile, modal and loading layers");
