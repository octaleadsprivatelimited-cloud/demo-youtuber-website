import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
function load(path, imports = {}) {
  const compiled = ts.transpileModule(fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
  const mod = {exports: {}};
  new Function('require', 'module', 'exports', compiled)(name => imports[name], mod, mod.exports);
  return mod.exports;
}
const media = load('lib/firestore-media.ts');
test('Firestore image encoding preserves bytes and stays under document limit', async () => {
  const bytes = fs.readFileSync(new URL('../public/hero/mahindra-575-di-xp-plus.webp', import.meta.url));
  const encoded = await media.encodeFirestoreImage(new File([bytes], 'tractor.webp', {type: 'image/webp'}));
  assert.deepEqual(Buffer.from(encoded.data, 'base64'), bytes);
  assert.ok(encoded.data.length <= 819200);
  const boundary = new Uint8Array(media.MAX_IMAGE_BYTES); boundary.set([255,216]);
  assert.equal((await media.encodeFirestoreImage(new File([boundary], 'boundary.jpg', {type:'image/jpeg'}))).data.length, 819200);
});
test('Firestore image uploads reject oversized, empty, spoofed and unsupported images', async () => {
  for (const file of [new File([new Uint8Array(media.MAX_IMAGE_BYTES+1)],'large.jpg',{type:'image/jpeg'}), new File([],'empty.jpg',{type:'image/jpeg'}), new File(['invalid'],'bad.png',{type:'image/png'}), new File(['<svg/>'],'bad.svg',{type:'image/svg+xml'})]) await assert.rejects(media.encodeFirestoreImage(file));
});
test('image route returns original bytes, rejects invalid ids, and handles missing media', async () => {
  const {GET} = load('app/api/media/[id]/route.ts', {'@/lib/firestore-media': media});
  const originalFetch=globalThis.fetch;
  const project=process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID='test-project';
  try {
    globalThis.fetch=async()=>Response.json({fields:{data:{stringValue:'/9g='},contentType:{stringValue:'image/jpeg'},size:{integerValue:'2'}}});
    const response=await GET(new Request('http://localhost'), {params:Promise.resolve({id:'abcdefghijklmnopqrst'})});
    assert.equal(response.status,200); assert.equal(response.headers.get('content-type'),'image/jpeg');
    assert.deepEqual(new Uint8Array(await response.arrayBuffer()),new Uint8Array([255,216]));
    assert.equal((await GET(new Request('http://localhost'),{params:Promise.resolve({id:'..'})})).status,404);
    globalThis.fetch=async()=>new Response('',{status:404});
    assert.equal((await GET(new Request('http://localhost'),{params:Promise.resolve({id:'abcdefghijklmnopqrst'})})).status,404);
  } finally {globalThis.fetch=originalFetch; if(project===undefined)delete process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;else process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID=project;}
});

test('large images are compressed, preserve aspect ratio and release decoded resources', async () => {
 const oldBitmap=globalThis.createImageBitmap, oldDocument=globalThis.document;
 let closed=false;const draws=[];
 const bytes=new Uint8Array(400000);bytes.set([82,73,70,70,0,0,0,0,87,69,66,80]);
 const canvas={width:0,height:0,getContext:()=>({clearRect(){},drawImage(...args){draws.push(args.slice(3));}}),toBlob(callback){callback(new Blob([bytes],{type:'image/webp'}));}};
 globalThis.createImageBitmap=async()=>({width:4000,height:2000,close(){closed=true;}});
 globalThis.document={createElement:()=>canvas};
 try {
  const encoded=await media.encodeFirestoreImage(new File([new Uint8Array(2000000)],'large.png',{type:'image/png'}));
  assert.equal(encoded.contentType,'image/webp');assert.equal(encoded.size,400000);
  assert.equal(canvas.width,2400);assert.equal(canvas.height,1200);assert.equal(closed,true);
 } finally {globalThis.createImageBitmap=oldBitmap;globalThis.document=oldDocument;}
});
