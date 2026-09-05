import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
function load(file) {
  const mod={exports:{}};
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(name=>load((name.startsWith('@/') ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file),name))+'.ts'),mod,mod.exports);
  return mod.exports;
}
const {prepareAdminRecord}=load('lib/admin-records.ts');
const {reviewTimestamp}=load('lib/editorial-review.ts');
const complete={title:'Editorial test',tractorId:'tractor-1',authorName:'Test editor',excerpt:'An editorial assessment.',content:'Detailed assessment of the engine, transmission and handling. '.repeat(4),score:8.2,verdict:'A suitable option for the described work.',methodology:'Desk research based on supplied specifications.',pros:'Clear controls\nService access',cons:['Noise'],status:'published'};
test('new reviews remain drafts and incomplete drafts can be saved',()=>{
  const result=prepareAdminRecord('expertReviews',{title:'Work in progress'});
  assert.equal(result.status,'draft');
  assert.equal(result.slug,'work-in-progress');
});
test('publication requires editorial evidence, a tractor and a finite score',()=>{
  for(const key of ['tractorId','excerpt','content','verdict','methodology','score']) {
    assert.throws(()=>prepareAdminRecord('expertReviews',{...complete,[key]:''}));
  }
  for(const score of [NaN,Infinity,-1,10.1,'invalid']) assert.throws(()=>prepareAdminRecord('expertReviews',{...complete,score}));
});
test('a complete review publishes and retains typed review details',()=>{
  const result=prepareAdminRecord('expertReviews',complete);
  assert.equal(result.status,'published');assert.equal(result.score,8.2);
  assert.equal(result.body,complete.content.trim());assert.deepEqual(result.pros,['Clear controls','Service access']);
  assert.deepEqual(result.cons,['Noise']);
});
test('unpublishing and archiving never silently republish a review',()=>{
  for(const status of ['draft','archived'])assert.equal(prepareAdminRecord('expertReviews',{...complete,status}).status,status);
  assert.throws(()=>prepareAdminRecord('expertReviews',{...complete,status:'approved'}));
});
test('publication timestamps support local ISO and Firestore values',()=>{
  assert.equal(reviewTimestamp('2026-01-01T00:00:00Z'),1767225600000);
  assert.equal(reviewTimestamp({seconds:100}),100000);
  assert.equal(reviewTimestamp(null),0);assert.equal(reviewTimestamp('invalid'),0);
});
