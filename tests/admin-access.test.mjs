import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import ts from 'typescript';
// These contract tests exercise the actual callable handlers with in-memory Firebase adapters.
// Deployment and live Firebase authorization still require a configured Firebase project.
function fixture(){
  const docs=new Map([['admins/root',{role:'Super Admin',active:true}],['admins/admin',{role:'Admin',active:true}],['admins/staff',{role:'Admin',active:true}]]);
  const users=new Map([['root',{customClaims:{admin:true,superAdmin:true,role:'Super Admin'}}],['admin',{customClaims:{admin:true,role:'Admin'}}],['staff',{customClaims:{admin:true,role:'Admin',unrelated:'preserve'},disabled:false}],['customer',{customClaims:{role:'Customer'},disabled:false}]]);
  const revoked=[];
  const doc=name=>({name,get:async()=>({exists:docs.has(name),data:()=>docs.get(name)}),set:async value=>docs.set(name,{...docs.get(name),...value})});
  const database={doc,batch:()=>{const writes=[];return{set:(ref,value)=>writes.push([ref,value]),commit:async()=>{for(const [ref,value]of writes)await ref.set(value);}};}};
  const auth={getUser:async uid=>users.get(uid),setCustomUserClaims:async(uid,customClaims)=>users.set(uid,{...users.get(uid),customClaims}),updateUser:async(uid,patch)=>users.set(uid,{...users.get(uid),...patch}),revokeRefreshTokens:async uid=>revoked.push(uid)};
  class HttpsError extends Error{constructor(code,message){super(message);this.code=code;}}
  const adapters={'firebase-admin/app':{initializeApp:()=>{}},'firebase-admin/auth':{getAuth:()=>auth},'firebase-admin/firestore':{getFirestore:()=>database},'firebase-functions/v2/https':{HttpsError,onCall:handler=>handler}};
  const source=fs.readFileSync(new URL('../functions/src/index.ts',import.meta.url),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};new Function('require','module','exports',compiled)(name=>adapters[name],mod,mod.exports);
  return{...mod.exports,docs,users,revoked};
}
const owner = {uid:'root',token:{email:'rakeshpatel0944@gmail.com',email_verified:true,firebase:{sign_in_provider:'google.com'}}};
test('only the verified Google owner can administer accounts, even without a profile', async()=>{
 const f=fixture();f.docs.delete('admins/root');
 await f.setUserRole({auth:owner,data:{uid:'staff',role:'Customer'}});
 assert.equal(f.docs.get('admins/staff').active,false);
 assert.equal(f.users.get('staff').customClaims.admin,false);
 assert.equal(f.users.get('staff').customClaims.unrelated,'preserve');
 assert.deepEqual(f.revoked,['staff']);
});
test('other emails, unverified emails, and non-Google sessions cannot access admin functions', async()=>{
 const f=fixture();
 for(const token of [
  {...owner.token,email:'someone@gmail.com'},
  {...owner.token,email_verified:false},
  {...owner.token,email_verified:undefined},
  {...owner.token,email:undefined},
  {...owner.token,firebase:{sign_in_provider:'password'}},
  {...owner.token,firebase:{}},
 ]) await assert.rejects(f.setUserDisabled({auth:{uid:'root',token},data:{uid:'staff',disabled:true}}), /access required|Google sign-in required/);
 await assert.rejects(f.setUserDisabled({data:{uid:'staff',disabled:true}}), /Sign in required/);
});
test('no role action can grant staff access to a second account',async()=>{
 const f=fixture();
 for(const role of ['Editor','Admin','Super Admin']) await assert.rejects(f.setUserRole({auth:owner,data:{uid:'customer',role}}), /Only the configured owner/);
});
test('owner can disable other users but cannot demote or disable their own account',async()=>{
 const f=fixture();await f.setUserDisabled({auth:owner,data:{uid:'staff',disabled:true}});
 assert.equal(f.users.get('staff').disabled,true);
 await assert.rejects(f.setUserRole({auth:owner,data:{uid:'root',role:'Customer'}}), /your own/);
 await assert.rejects(f.setUserDisabled({auth:owner,data:{uid:'root',disabled:true}}), /your own/);
});
test('client identity check requires the exact verified Google owner',()=>{
 const source=fs.readFileSync(new URL('../lib/admin-identity.ts',import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};new Function('module','exports',code)(mod,mod.exports);
 const check=mod.exports.isOwnerToken;
 assert.equal(check({signInProvider:'google.com',claims:owner.token}),true);
 for(const claims of [{...owner.token,email:'other@gmail.com'},{...owner.token,email_verified:false},{}]) assert.equal(check({signInProvider:'google.com',claims}),false);
 assert.equal(check({signInProvider:'password',claims:owner.token}),false);
});
