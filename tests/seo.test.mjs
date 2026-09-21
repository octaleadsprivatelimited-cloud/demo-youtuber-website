import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root=process.cwd();
function load(name){
 const filename=path.resolve(root,name),mod={exports:{}};
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',code)(key=>load((key.startsWith('@/')?key.slice(2):path.resolve(path.dirname(filename),key))+'.ts'),mod,mod.exports);
 return mod.exports;
}
test('canonical origin cannot be blank, relative, or localhost',()=>{
 const {siteOrigin}=load('lib/site-url.ts');
 for(const value of ['', 'http://localhost:3000','invalid','javascript:alert(1)'])assert.equal(siteOrigin(value),'https://www.rjtractortechs.com');
 assert.equal(siteOrigin('https://www.rjtractortechs.com/'),'https://www.rjtractortechs.com');
});
test('sitemap includes published detail URLs and actual modification dates',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(_url,options)=>{
  const q=JSON.parse(options.body).structuredQuery;
  assert.equal(q.where.fieldFilter.value.stringValue,'published');
  const name=q.from[0].collectionId;
  const values=name==='tractors'?{slug:'575-di',brandSlug:'mahindra',updatedAt:'2026-09-20T10:00:00Z'}:name==='dealers'?{slug:'test-dealer'}:{};
  return new Response(JSON.stringify(Object.keys(values).length?[{document:{name:'projects/test/documents/'+name+'/test',fields:Object.fromEntries(Object.entries(values).map(([key,value])=>[key,{[key==='updatedAt'?'timestampValue':'stringValue']:value}]))}}]:[{}]));
 };
 try{
  const entries=await load('app/sitemap.ts').default();
  assert.ok(entries.every(row=>row.url.startsWith('https://www.rjtractortechs.com')));
  assert.ok(entries.some(row=>row.url.endsWith('/tractor/mahindra/575-di')&&row.lastModified.toISOString()==='2026-09-20T10:00:00.000Z'));
  assert.ok(entries.some(row=>row.url.endsWith('/dealers/test-dealer')));
  assert.ok(!entries.some(row=>/\/(admin|login|account|search)(\/|$)/.test(row.url)));
  assert.equal(entries[0].lastModified,undefined);
 }finally{globalThis.fetch=original;}
});
test('robots sitemap is absolute and private route roots are excluded',()=>{
 const result=load('app/robots.ts').default();
 assert.equal(result.sitemap,'https://www.rjtractortechs.com/sitemap.xml');
 for(const route of ['/admin','/account','/login'])assert.ok(result.rules[0].disallow.includes(route));
});
test('admin SEO overrides are returned in server metadata and social tags',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify([{document:{name:'projects/test/documents/seo/test',fields:{path:{stringValue:'/tractors'},title:{stringValue:'Owner tractor title'},description:{stringValue:'Owner description'},image:{stringValue:'/api/media/example'}}}}]));
 try{
  const result=await load('lib/seo-metadata.ts').withSeoOverride('/tractors',{title:'Default',description:'Default description'});
  assert.equal(result.title,'Owner tractor title');assert.equal(result.openGraph.title,'Owner tractor title');assert.equal(result.twitter.description,'Owner description');assert.equal(result.alternates.canonical,'/tractors');
 }finally{globalThis.fetch=original;}
});
