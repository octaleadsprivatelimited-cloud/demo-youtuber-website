import {before, after, test} from 'node:test';
import {readFileSync} from 'node:fs';
import {initializeTestEnvironment, assertSucceeds, assertFails} from '@firebase/rules-unit-testing';
import {doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp, collection, getDocs, query, where} from 'firebase/firestore';
let env;
const claims = {email:'rakeshpatel0944@gmail.com',email_verified:true,firebase:{sign_in_provider:'google.com'}};
const dbFor = (uid, token = {}) => env.authenticatedContext(uid, token).firestore();
before(async () => {
  env = await initializeTestEnvironment({projectId:'demo-rj-security',firestore:{rules:readFileSync('firestore.rules','utf8')}});
});
after(async () => { await env?.cleanup(); });
test('only the verified Google owner can write catalog and configuration', async () => {
  const owner = dbFor('owner', claims);
  for (const name of ['tractors','settings','seo']) {
    await assertSucceeds(setDoc(doc(owner,name,'test'),{status:'draft'}));
    for(const token of [{}, {...claims,email:'other@gmail.com',admin:true,role:'Super Admin'}, {...claims,email_verified:false}, {...claims,firebase:{sign_in_provider:'password'}}]) {
      await assertFails(setDoc(doc(dbFor('outsider',token),name,'test'),{status:'published'}));
      await assertFails(getDoc(doc(dbFor('outsider',token),name,'test')));
    }
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),name,'test')));
    await assertSucceeds(updateDoc(doc(owner,name,'test'),{status:'published'}));
    await assertSucceeds(getDocs(query(collection(env.unauthenticatedContext().firestore(),name),where('status','==','published'))));
  }
});
test('comparison owners can read/update/delete; other users cannot steal or transfer ownership',async()=>{
  const alice=dbFor('alice'), bob=dbFor('bob');
  await assertSucceeds(setDoc(doc(alice,'comparisons','private'),{userId:'alice',items:['one']}));
  await assertSucceeds(getDoc(doc(alice,'comparisons','private')));
  await assertFails(getDoc(doc(bob,'comparisons','private')));
  await assertFails(updateDoc(doc(bob,'comparisons','private'),{userId:'bob'}));
  await assertFails(updateDoc(doc(alice,'comparisons','private'),{userId:'bob'}));
  await assertSucceeds(updateDoc(doc(alice,'comparisons','private'),{items:['two']}));
  await assertFails(deleteDoc(doc(bob,'comparisons','private')));
  await assertSucceeds(deleteDoc(doc(alice,'comparisons','private')));
});
test('public submissions accept real form data and reject forged workflow fields and identity', async()=>{
 const db=env.unauthenticatedContext().firestore();
 const lead={name:'Test Name',phone:'9876543210',city:'Test',state:'Test',source:'contact',status:'New',assignedTo:null,notes:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
 const contact={name:'Test Name',email:'test@example.com',message:'A valid message',status:'New',createdAt:serverTimestamp()};
 const subscriber={email:'test@example.com',status:'active',createdAt:serverTimestamp()};
 for(const [name,data] of [['leads',lead],['contactMessages',contact],['newsletterSubscribers',subscriber]]){
  await assertSucceeds(setDoc(doc(db,name,'valid'),data));
  await assertFails(getDoc(doc(db,name,'valid')));
  await assertFails(setDoc(doc(db,name,'forged'),{...data,status:'approved'}));
  await assertFails(setDoc(doc(db,name,'extra'),{...data,admin:true}));
 }
 await assertFails(setDoc(doc(db,'leads','impersonation'),{...lead,userId:'victim'}));
 await assertFails(setDoc(doc(db,'contactMessages','oversized'),{...contact,message:'x'.repeat(10001)}));
 await assertFails(setDoc(doc(db,'newsletterSubscribers','invalid'),{...subscriber,email:'invalid'}));
});
test('account profiles and legacy role records cannot grant owner access',async()=>{
 const owner=dbFor('owner',claims);
 await env.withSecurityRulesDisabled(async ctx=>{await setDoc(doc(ctx.firestore(),'users','other'),{email:'other@example.com'});});
 await assertSucceeds(getDoc(doc(owner,'users','other')));
 await assertFails(getDoc(doc(dbFor('other'),'users','other')));
 await assertFails(setDoc(doc(owner,'admins','other'),{role:'Super Admin',active:true}));
 await assertFails(setDoc(doc(dbFor('other'),'users','other'),{role:'Super Admin'}));
});

test('all admin modules use real Firestore CRUD, publication and image upload under owner rules', async()=>{
 const assert = (await import('node:assert/strict')).default;
 const ts = (await import('typescript')).default;
 const path = await import('node:path');
 const {createRequire} = await import('node:module');
 const {fileURLToPath} = await import('node:url');
 const require = createRequire(import.meta.url);
 const root = fileURLToPath(new URL('..',import.meta.url));
 const owner = dbFor('owner',claims);
 const firestore = await import('firebase/firestore');
 const cache = new Map();
 function load(name) {
  const filename=path.resolve(root,name);
  if(cache.has(filename))return cache.get(filename).exports;
  const mod={exports:{}};cache.set(filename,mod);
  const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const resolve=specifier=>{
   if(specifier==='firebase/firestore')return firestore;
   if(specifier==='@/lib/firebase/config')return {firebaseConfig:{projectId:'demo-rj-security'}};
   if(specifier==='@/lib/firebase/client')return {db:owner,isLocalDemo:false,isFirebaseConfigured:true};
   if(specifier.startsWith('@/')||specifier.startsWith('.')){
    const target=specifier.startsWith('@/')?path.join(root,specifier.slice(2)):path.resolve(path.dirname(filename),specifier);
    return load(target+(path.extname(target)?'':'.ts'));
   }
   return require(specifier);
  };
  new Function('require','module','exports',code)(resolve,mod,mod.exports);
  return mod.exports;
 }
 const admin=load('services/admin.ts');
 const bytes=readFileSync('public/hero/mahindra-575-di-xp-plus.webp');
 const image=await admin.uploadAdminImage(new File([bytes],'tractor.webp',{type:'image/webp'}),'heroSlides');
 const replacement=await admin.uploadAdminImage(new File([bytes],'replacement.webp',{type:'image/webp'}),'heroSlides');
 const id=image.split('/').at(-1);
 const {GET}=load('app/api/media/[id]/route.ts');
 const originalFetch=globalThis.fetch;
 try {
  globalThis.fetch=(url, options)=>{
   const parsed=new URL(url);
   assert.equal(parsed.hostname,'firestore.googleapis.com');
   assert.ok(parsed.pathname.startsWith('/v1/projects/demo-rj-security/'));
   return originalFetch('http://'+process.env.FIRESTORE_EMULATOR_HOST+parsed.pathname,options);
  };
  const response=await GET(new Request('http://localhost'+image),{params:Promise.resolve({id})});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('content-type'),'image/webp');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
 } finally {globalThis.fetch=originalFetch;}
 const stored=await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),'media',id)));
 assert.deepEqual(Buffer.from(stored.data().data,'base64'),bytes);
 await assertFails(setDoc(doc(dbFor('other'),'media','forbidden'),{...stored.data(),createdAt:serverTimestamp()}));
 await assertFails(setDoc(doc(owner,'media','too-large'),{...stored.data(),size:1_000_000,createdAt:serverTimestamp()}));
 await assert.rejects(admin.uploadAdminImage(new File([new Uint8Array(1_000_000)],'large.jpg',{type:'image/jpeg'}),'heroSlides'),/under 1 MB/);
 const cases=[
  ['brands',{title:'Emulator brand',logo:image}],
  ['equipment',{title:'Emulator implement',image}],
  ['articleCategories',{title:'Emulator category'}],
  ['articles',{title:'Emulator article',image}],
  ['videos',{title:'Emulator video',youtubeId:'abcdefghijk',thumbnail:image}],
  ['dealers',{title:'Emulator dealer',logo:image,services:'Repairs\nSales',email:'dealer@example.com',whatsapp:'9876543210'}],
  ['heroSlides',{title:'Emulator slide',image}],
  ['partners',{title:'Emulator partner',image}],
  ['banners',{title:'Emulator banner',image}],
  ['advertisements',{title:'Emulator ad',image}],
  ['seo',{title:'Emulator SEO',path:'/emulator-test',image}],
  ['settings',{key:'logo',value:image}],
  ['homepageSections',{key:'hero',title:'Emulator homepage',visible:true}],
 ];
 const ids=[];
 for(const [name,input] of cases){
  const recordId=await admin.saveAdminRecord(name,undefined,{...input,status:'draft'});
  ids.push([name,recordId]);
  const original=await admin.getAdminRecord(name,recordId);
  assert.equal(original.status,'draft',name);
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),name,recordId)));
  await admin.saveAdminRecord(name,recordId,{status:'published'},original);
  const publicRecord=await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),name,recordId)));
  assert.equal(publicRecord.data().status,'published');
  assert.ok((await admin.listAdminRecords(name)).some(row=>row.id===recordId));
  const imageKey=['image','logo','thumbnail','value'].find(key=>input[key]===image);
  if(imageKey){
   await admin.saveAdminRecord(name,recordId,{[imageKey]:replacement});
   assert.equal((await admin.getAdminRecord(name,recordId))[imageKey],replacement);
   if(name!=='partners'){
    await admin.saveAdminRecord(name,recordId,{[imageKey]:''});
    assert.equal((await admin.getAdminRecord(name,recordId))[imageKey],'');
   }
  }
  if(name==='dealers')assert.deepEqual((await admin.getAdminRecord(name,recordId)).services,['Repairs','Sales']);
  await admin.saveAdminRecord(name,recordId,{status:'archived'});
  await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),name,recordId)));
 }
 const brandId=ids.find(([name])=>name==='brands')[1];
 const tractorId=await admin.saveAdminRecord('tractors',undefined,{brandId,model:'Emulator tractor',image,status:'published'});
 await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),'tractors',tractorId)));
 const reviewId=await admin.saveAdminRecord('expertReviews',undefined,{title:'Emulator review',tractorId,image,status:'draft'});
 await admin.saveAdminRecord('expertReviews',reviewId,{status:'published',authorName:'Owner',excerpt:'Summary',content:'A detailed assessment of this tractor. '.repeat(5),verdict:'Recommended',methodology:'Field tested',score:8});
 await assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(),'expertReviews',reviewId)));
 await assert.rejects(admin.removeAdminRecord('tractors',tractorId),/still in use/);
 await admin.removeAdminRecord('expertReviews',reviewId);
 await admin.removeAdminRecord('tractors',tractorId);
 for(const [name,recordId] of ids){await admin.removeAdminRecord(name,recordId);assert.equal(await admin.getAdminRecord(name,recordId),null);}
 for(const [name,input,patch] of [
  ['leads',{name:'Test owner',phone:'9876543210',city:'Test',state:'Test',source:'contact',status:'New',notes:'',assignedTo:null,createdAt:serverTimestamp(),updatedAt:serverTimestamp()},{status:'Contacted',notes:'Follow up'}],
  ['contactMessages',{name:'Test',email:'test@example.com',message:'Test enquiry',status:'New',createdAt:serverTimestamp()},{message:'Edited enquiry'}],
  ['newsletterSubscribers',{email:'test@example.com',status:'active',createdAt:serverTimestamp()},{email:'updated@example.com'}],
 ]){
  await assertSucceeds(setDoc(doc(env.unauthenticatedContext().firestore(),name,'workflow'),input));
  assert.ok((await admin.listAdminRecords(name)).some(row=>row.id==='workflow'));
  if(name==='leads'){
   const leads=load('services/leads.ts');
   await leads.updateLeadStatus('workflow',patch.status);
   await leads.updateLeadNotes('workflow',patch.notes);
   await leads.updateLeadDetails('workflow',{city:'Updated city'});
   assert.equal((await admin.getAdminRecord(name,'workflow')).city,'Updated city');
  } else await admin.saveAdminRecord(name,'workflow',patch);
  for(const [key,value] of Object.entries(patch))assert.equal((await admin.getAdminRecord(name,'workflow'))[key],value);
  await admin.removeAdminRecord(name,'workflow');assert.equal(await admin.getAdminRecord(name,'workflow'),null);
 }
 await assertSucceeds(deleteDoc(doc(owner,'media',id)));
 await assertSucceeds(deleteDoc(doc(owner,'media',replacement.split('/').at(-1))));
});
