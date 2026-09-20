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
