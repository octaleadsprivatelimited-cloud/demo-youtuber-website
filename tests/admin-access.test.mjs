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
test('demotion removes admin profile access, preserves other claims and revokes sessions',async()=>{
  const f=fixture();await f.setUserRole({auth:{uid:'root'},data:{uid:'staff',role:'Customer'}});
  assert.equal(f.docs.get('admins/staff').active,false);assert.equal(f.users.get('staff').customClaims.admin,false);
  assert.equal(f.users.get('staff').customClaims.unrelated,'preserve');assert.deepEqual(f.revoked,['staff']);
});
test('regular admins cannot demote, disable or promote administrator accounts',async()=>{
  const f=fixture();
  await assert.rejects(f.setUserRole({auth:{uid:'admin'},data:{uid:'staff',role:'Customer'}}),/Only a Super Admin/);
  await assert.rejects(f.setUserDisabled({auth:{uid:'admin'},data:{uid:'root',disabled:true}}),/Only a Super Admin/);
  await assert.rejects(f.setUserRole({auth:{uid:'admin'},data:{uid:'customer',role:'Admin'}}),/Only a Super Admin/);
});
test('disabling and enabling staff also updates the authoritative admin profile',async()=>{
  const f=fixture();await f.setUserDisabled({auth:{uid:'root'},data:{uid:'staff',disabled:true}});
  assert.equal(f.users.get('staff').disabled,true);assert.equal(f.docs.get('admins/staff').active,false);
  await f.setUserDisabled({auth:{uid:'root'},data:{uid:'staff',disabled:false}});
  assert.equal(f.docs.get('admins/staff').active,true);
});
test('self-demotion and self-disable cannot lock out the active administrator',async()=>{
  const f=fixture();
  await assert.rejects(f.setUserRole({auth:{uid:'root'},data:{uid:'root',role:'Customer'}}),/your own/);
  await assert.rejects(f.setUserDisabled({auth:{uid:'root'},data:{uid:'root',disabled:true}}),/your own/);
});

test('editor role permits editorial membership without administrator claims',async()=>{
 const f=fixture();await f.setUserRole({auth:{uid:'root'},data:{uid:'customer',role:'Editor'}});
 assert.equal(f.docs.get('admins/customer').active,true);
 assert.equal(f.docs.get('admins/customer').role,'Editor');
 assert.equal(f.users.get('customer').customClaims.admin,false);
 await assert.rejects(f.setUserRole({auth:{uid:'customer'},data:{uid:'staff',role:'Customer'}}),/Administrator access required/);
 await f.setUserDisabled({auth:{uid:'root'},data:{uid:'customer',disabled:true}});
 assert.equal(f.docs.get('admins/customer').active,false);
});
