import test, {after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

// Execute the actual services against isolated collections on the running local CMS.
// No existing project content is read or overwritten by these fixtures.
const root=fileURLToPath(new URL('..',import.meta.url));
const require=createRequire(import.meta.url);
const modules=new Map();
const base=process.env.LOCAL_CMS_TEST_URL||'http://localhost:3000';
const prefix='qa-'+crypto.randomUUID().slice(0,8)+'-';
const collections=new Set();
const nativeFetch=globalThis.fetch;
const windowTarget=new EventTarget();
globalThis.window=Object.assign(windowTarget,{setInterval,clearInterval});
globalThis.document={hidden:false};
globalThis.localStorage={getItem:()=>null};
globalThis.fetch=(input,init)=>{
  const url=new URL(input,base);
  if(url.pathname.startsWith('/api/local-cms/')){
    const collection=decodeURIComponent(url.pathname.split('/').at(-1));
    collections.add(collection);url.pathname='/api/local-cms/'+prefix+collection;
  }
  return nativeFetch(url,init);
};
function load(name){
  const filename=path.resolve(root,name);
  if(modules.has(filename))return modules.get(filename).exports;
  const mod={exports:{}};modules.set(filename,mod);
  const source=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const resolve=specifier=>{
    if(specifier==='@/lib/firebase/client')return {db:null,storage:null,firebaseApp:null,isLocalDemo:true,isFirebaseConfigured:true,initializeAnalytics:async()=>null};
    if(specifier.startsWith('@/')||specifier.startsWith('.')){
      const target=specifier.startsWith('@/')?path.join(root,specifier.slice(2)):path.resolve(path.dirname(filename),specifier);
      return load(target+(path.extname(target)?'':'.ts'));
    }
    return require(specifier);
  };
  new Function('require','module','exports',source)(resolve,mod,mod.exports);
  return mod.exports;
}
const admin=load('services/admin.ts');
const site=load('services/site-data.ts');
const local=load('lib/local-demo.ts');
const catalog=load('services/tractors.ts');
const media=load('services/media.ts');
const reviews=load('services/phase-three.ts');
const leads=load('services/leads.ts');
const publicContent=load('services/public-content.ts');
const home=load('config/homepage-sections.ts');
const sections=load('config/admin-sections.ts').adminSections;
const navigation=load('config/admin-navigation.ts').adminNavigationGroups;
after(async()=>{
  for(const name of collections){
    const url=base+'/api/local-cms/'+prefix+name;
    const current=await(await nativeFetch(url)).json();
    await nativeFetch(url,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({records:[],revision:current.revision})});
  }
  globalThis.fetch=nativeFetch;
});

test('catalog: real brand references, prices, finder filters, comparison, pagination and deletion guard',async()=>{
  const brandId=await admin.saveAdminRecord('brands',undefined,{title:'QA Brand',slug:'qa-brand-custom',logo:'/qa-logo.png'});
  const first=await admin.saveAdminRecord('tractors',undefined,{brandId,model:'Model 1',horsepower:47,price:700000,maxPrice:750000,condition:'new'});
  const second=await admin.saveAdminRecord('tractors',undefined,{brandId,model:'Model 2',horsepower:55,condition:'used'});
  const tractor=await catalog.getTractorBySlugs('qa-brand-custom','model-1');
  assert.equal(tractor.id,first);assert.equal(tractor.brandId,brandId);assert.equal(tractor.hp,47);assert.equal(tractor.maxPrice,750000);
  assert.deepEqual((await catalog.listTractors({brandId,condition:'new',minHp:45,maxHp:50})).items.map(x=>x.id),[first]);
  assert.equal((await reviews.getTractorsByIds([first]))[0].brandName,'QA Brand');
  const page=await catalog.listTractors({brandId,pageSize:1});
  const next=await catalog.listTractors({brandId,pageSize:1},page.cursor);
  assert.notEqual(page.items[0].id,next.items[0].id);assert.equal(next.hasMore,false);
  await assert.rejects(admin.removeAdminRecord('brands',brandId),/still in use/);
  await admin.removeAdminRecord('tractors',second);await admin.removeAdminRecord('tractors',first);await admin.removeAdminRecord('brands',brandId);
  assert.equal(await catalog.getTractorBySlugs('qa-brand-custom','model-1'),null);
});
test('articles, news and categories share canonical fields and stable URLs',async()=>{
  const categoryId=await admin.saveAdminRecord('articleCategories',undefined,{title:'Buying guides',slug:'guides-custom'});
  const id=await admin.saveAdminRecord('articles',undefined,{title:'QA news',articleType:'news',categoryId,content:'First body',image:'/first.png'});
  assert.equal((await media.listArticles('news','guides-custom'))[0].id,id);
  assert.equal((await media.listArticles('article')).length,0);
  const saved=(await admin.listAdminRecords('articles'))[0];
  await admin.saveAdminRecord('articles',id,{...saved,title:'Renamed',content:'Updated body',image:'/updated.png'});
  const article=await media.getArticle('qa-news');assert.equal(article.body,'Updated body');assert.equal(article.coverImage,'/updated.png');
  assert.ok(saved.publishedAt);await assert.rejects(admin.removeAdminRecord('articleCategories',categoryId),/still in use/);
});
test('equipment, videos, dealers and expert reviews render their saved public data',async()=>{
  await admin.saveAdminRecord('equipment',undefined,{title:'QA implement',category:'Cultivator',price:50000,description:'Saved specs'});
  assert.equal((await media.getEquipment('cultivator','qa-implement')).description,'Saved specs');
  await admin.saveAdminRecord('videos',undefined,{title:'QA video',youtubeId:'https://youtu.be/abcdefghijk'});
  assert.equal((await media.getVideo('qa-video')).youtubeVideoId,'abcdefghijk');
  await assert.rejects(admin.saveAdminRecord('videos',undefined,{title:'Bad video',youtubeId:'invalid'}),/valid YouTube/);
  await admin.saveAdminRecord('dealers',undefined,{title:'QA dealer',brand:'QA Brand',city:'Test city',district:'Test district',state:'Test state'});
  assert.equal((await media.listDealers({district:'Test district'}))[0].name,'QA dealer');
  await admin.saveAdminRecord('expertReviews',undefined,{title:'QA expert',content:'Actual full review',verdict:'Verdict',score:8,image:'/review.png'});
  const expert=await reviews.getExpertReview('qa-expert');assert.equal(expert.body,'Actual full review');assert.equal(expert.score,8);assert.equal(expert.coverImage,'/review.png');
});
test('owner review moderation controls public visibility without rewriting submitted content',async()=>{
  await reviews.submitOwnerReview({tractorId:'test-tractor',tractorName:'QA tractor',userId:'qa-owner',userName:'Owner',rating:5,title:'Saved review',comment:'Owner content'});
  const review=(await admin.listAdminRecords('reviews'))[0];assert.equal(review.status,'pending');
  assert.deepEqual(await site.listPublicRecords('reviews'),[]);
  await admin.saveAdminRecord('reviews',review.id,{...review,status:'approved'});
  assert.equal((await site.listPublicRecords('reviews'))[0].comment,'Owner content');
  await admin.saveAdminRecord('reviews',review.id,{...review,status:'rejected'});
  assert.deepEqual(await reviews.listApprovedOwnerReviews('test-tractor'),[]);
});
test('hero and partner edits notify public subscribers; deleting never restores old content',async()=>{
  const hero=load('services/hero-slides.ts');const partners=load('services/partners.ts');
  const received=[];const stop=hero.subscribeHeroSlides(rows=>received.push(rows));
  try{
    const id=await admin.saveAdminRecord('heroSlides',undefined,{title:'QA slide',order:1,image:'/first.png'});
    await admin.saveAdminRecord('heroSlides',id,{title:'QA slide',order:1,image:'/replacement.png'});
    const until=Date.now()+5000;while(!received.some(rows=>rows.some(row=>row.image==='/replacement.png'))&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,50));
    assert.ok(received.some(rows=>rows.some(row=>row.image==='/replacement.png')));
    await admin.removeAdminRecord('heroSlides',id);assert.deepEqual(await site.listPublicRecords('heroSlides'),[]);
    const partner=await admin.saveAdminRecord('partners',undefined,{title:'QA partner',order:1,image:'/logo.png'});
    assert.equal((await site.listPublicRecords('partners'))[0].image,'/logo.png');await admin.removeAdminRecord('partners',partner);
  }finally{stop();}
});
test('homepage visibility, settings, SEO and promotions save without duplicate keys or modules',async()=>{
  await admin.saveAdminRecord('homepageSections',undefined,{key:'compare',title:'Custom comparison',order:1,visible:false});
  const visible=home.resolveHomepageSections(await site.listPublicRecords('homepageSections'));
  assert.ok(!visible.some(section=>section.key==='compare'));
  await admin.saveAdminRecord('settings',undefined,{key:'email',value:'qa@example.test'});
  assert.equal((await publicContent.getPublishedSetting('email')).value,'qa@example.test');
  await assert.rejects(admin.saveAdminRecord('settings',undefined,{key:'email',value:'duplicate@example.test'}),/already exists/);
  await admin.saveAdminRecord('seo',undefined,{title:'Custom title',path:'/tractors',description:'Custom description',image:'/social.png'});
  assert.equal((await site.listPublicRecords('seo'))[0].image,'/social.png');
  await admin.saveAdminRecord('banners',undefined,{title:'Campaign',ctaUrl:'/tractors'});
  await admin.saveAdminRecord('advertisements',undefined,{title:'Sponsor',placement:'homepage',destinationUrl:'https://example.test'});
  assert.equal((await site.listPublicRecords('banners')).length,1);assert.equal((await site.listPublicRecords('advertisements')).length,1);
  const links=navigation.flatMap(group=>group.items.map(item=>item.href));assert.equal(new Set(links).size,links.length);
  assert.ok(links.includes('/admin/promotions'));assert.ok(!links.includes('/admin/banners'));assert.ok(!links.includes('/admin/advertisements'));assert.ok(!links.includes('/admin/subscribers'));
  assert.equal(sections.reviews.readOnly,true);assert.equal(sections['contact-messages'].allowCreate,false);
});
test('public enquiries reach the inbox and CRM with editable notes and status',async()=>{
  await publicContent.submitContact({name:'QA contact',email:'qa@example.test',message:'QA message'});
  assert.equal((await admin.listAdminRecords('contactMessages'))[0].message,'QA message');
  await leads.createLead({name:'QA lead',phone:'1234567890',city:'Test',state:'Test',source:'qa'});
  const lead=(await leads.listLeads({}))[0];assert.ok(lead.createdAt);
  await leads.updateLeadStatus(lead.id,'Contacted');await leads.updateLeadNotes(lead.id,'Called owner');
  const updated=(await leads.listLeads({status:'Contacted'}))[0];assert.equal(updated.notes,'Called owner');
  await leads.deleteLead(lead.id);assert.deepEqual(await leads.listLeads({}),[]);
});
test('legacy aliases cannot override edited images or model names',()=>{
  const tractor=catalog.normalizeTractor({id:'qa',name:'New name',displayName:'Old name',model:'New model',modelName:'Old model',image:'/new.png',thumbnail:'/old.png'});
  assert.equal(tractor.name,'New name');assert.equal(tractor.model,'New model');assert.equal(tractor.image,'/new.png');
});
test('clearing an optional category removes the old public category',async()=>{
  const item=(await admin.listAdminRecords('articles'))[0];
  await admin.saveAdminRecord('articles',item.id,{...item,categoryId:''});
  assert.equal((await media.getArticle(item.slug)).categoryName,'');
  assert.deepEqual(await media.listArticles(undefined,'guides-custom'),[]);
});
test('local account controls cannot pretend to change real access',async()=>{
  const users=load('services/user-admin.ts');assert.deepEqual(await users.listUsers(),[]);
  await assert.rejects(users.setUserRole('qa','Admin'),/requires Firebase/);
  await assert.rejects(users.setUserDisabled('qa',true),/requires Firebase/);
});
