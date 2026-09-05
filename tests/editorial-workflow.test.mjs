import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const root = path.resolve('.');
const cache = new Map();
function load(file) {
  const absolute = path.resolve(root,file);
  if (absolute.endsWith('/lib/firebase/client.ts')) return {db:null,storage:null,isLocalDemo:true,isFirebaseConfigured:true};
  if(cache.has(absolute))return cache.get(absolute).exports;
  const mod={exports:{}};cache.set(absolute,mod);
  const code=ts.transpileModule(fs.readFileSync(absolute,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(name => name.startsWith('@/') ? load(name.slice(2)+'.ts') : name.startsWith('.') ? load(path.resolve(path.dirname(absolute),name)+'.ts') : require(name),mod,mod.exports);
  return mod.exports;
}
test('editorial workflow persists drafts, publishes, edits without changing URLs and archives',async()=>{
  const originalFetch=globalThis.fetch;
  const previous={window:globalThis.window,localStorage:globalThis.localStorage,BroadcastChannel:globalThis.BroadcastChannel};
  const base=process.env.LOCAL_CMS_TEST_URL || 'http://localhost:3000';
  const suffix=crypto.randomUUID();
  globalThis.window=new EventTarget();
  globalThis.localStorage={getItem:()=>null};
  globalThis.BroadcastChannel=undefined;
  globalThis.fetch=(url,options)=>originalFetch(base+String(url).replace('/api/local-cms/tractors','/api/local-cms/qa-tractors-'+suffix).replace('/api/local-cms/expertReviews','/api/local-cms/qa-reviews-'+suffix),options);
  const {writeLocal}=load('lib/local-demo.ts');
  const {saveAdminRecord,getAdminRecord}=load('services/admin.ts');
  const {listPublicRecords}=load('services/site-data.ts');
  try {
    await writeLocal('tractors',[{id:'test-tractor',name:'Test tractor',status:'published'}]);
    const id=await saveAdminRecord('expertReviews',undefined,{title:'Workflow fixture',tractorId:'test-tractor'});
    assert.equal((await getAdminRecord('expertReviews',id)).status,'draft');
    assert.equal((await listPublicRecords('expertReviews')).length,0);
    await assert.rejects(saveAdminRecord('expertReviews',id,{status:'published'}),/before publishing/);
    await saveAdminRecord('expertReviews',id,{status:'published',authorName:'Test editor',excerpt:'Test summary',content:'Testing editorial persistence and publication. '.repeat(4),score:8,verdict:'Test verdict',methodology:'Local automated test only',pros:['A'],cons:['B']});
    let publicRows=await listPublicRecords('expertReviews');
    assert.equal(publicRows.length,1);assert.equal(publicRows[0].tractorName,'Test tractor');assert.ok(publicRows[0].publishedAt);
    const original=await getAdminRecord('expertReviews',id);
    await saveAdminRecord('expertReviews',id,{title:'Updated fixture'},original);
    assert.equal((await getAdminRecord('expertReviews',id)).slug,'workflow-fixture');
    await assert.rejects(saveAdminRecord('expertReviews',id,{title:'Stale fixture'},original),/changed since/);
    await saveAdminRecord('expertReviews',id,{status:'archived'});
    assert.equal((await listPublicRecords('expertReviews')).length,0);
    assert.equal((await getAdminRecord('expertReviews',id)).status,'archived');
  } finally {
    await writeLocal('expertReviews',[]);
    await writeLocal('tractors',[]);
    globalThis.fetch=originalFetch;
    for(const [key,value] of Object.entries(previous)) {if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  }
});
