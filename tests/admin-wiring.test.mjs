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
  const hero=load('services/hero-slides.ts');
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
  for(const key of ['reviews','expert-reviews']){
    assert.ok(!links.includes('/admin/'+key));
    assert.equal(sections[key],undefined);
  }
  const dashboard=load('config/admin-navigation.ts').adminDashboardItems;
  assert.ok(dashboard.every(item=>!['reviews','expertReviews'].includes(item.collection)));
 assert.equal(sections['contact-messages'].allowCreate,false);
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

test('account reviews include pending submissions belonging only to the signed-in owner',async()=>{
  await local.writeLocal('reviews',[{id:'mine',userId:'owner-a',status:'pending',title:'My review'},{id:'other',userId:'owner-b',status:'approved',title:'Other review'}]);
  const account=load('services/account-content.ts');
  assert.deepEqual((await account.listMyReviews('owner-a')).map(item=>item.id),['mine']);
  assert.deepEqual(await account.listMyReviews(''),[]);
});
test('article reading content handles adjacent headings, paragraphs and lists without interpreting HTML',()=>{
  const {parseReadingContent}=load('utils/reading-content.ts');
  const result=parseReadingContent('# Heading\nParagraph\n- First\n- Second\n\n### Notes\n<img src=x onerror=alert(1)>');
  assert.deepEqual(result,[{kind:'heading',text:'Heading',level:2},{kind:'paragraph',text:'Paragraph'},{kind:'list',items:['First','Second']},{kind:'heading',text:'Notes',level:3},{kind:'paragraph',text:'<img src=x onerror=alert(1)>'}]);
});


test('site search ranks exact names and matches reordered prefixes, model numbers and horsepower',()=>{
 const {buildSearchItems,findSearchResults}=load('utils/site-search.ts');
 const items=buildSearchItems('tractors',[
   {id:'best',status:'published',brand:'Mahindra',brandSlug:'mahindra',model:'575 DI XP Plus',name:'Mahindra 575 DI XP Plus',slug:'575-di-xp-plus',hp:47,driveType:'2WD'},
   {id:'other',status:'published',brand:'Mahindra',model:'475 DI',slug:'475-di',hp:42},
   {id:'draft',status:'draft',brand:'Mahindra',model:'575 DI Secret',slug:'secret'},
 ]);
 assert.deepEqual(findSearchResults(items,'  PLUS mahind 575-DI  ').map(item=>item.id),['tractors:best']);
 assert.deepEqual(findSearchResults(items,'47HP').map(item=>item.id),['tractors:best']);
 assert.equal(findSearchResults(items,'475')[0].id,'tractors:other');
 assert.equal(findSearchResults(items,'mahindra','Articles').length,0);
 assert.equal(findSearchResults(items,'   ').length,0);
 assert.equal(findSearchResults(items,'secret').length,0);
 const brands=buildSearchItems('brands',[{id:'brand',status:'published',name:'Mahindra',slug:'mahindra'}]);
 assert.equal(findSearchResults([...items,...brands],'Mahindra')[0].category,'Brands');
 assert.equal(findSearchResults([...items,...items],'47 hp').length,1);
});

test('site search preserves content routes and matches topics and dealer locations',()=>{
 const {buildSearchItems,findSearchResults}=load('utils/site-search.ts');
 const article=buildSearchItems('articles',[{id:'a',status:'published',title:'Field notes',slug:'field-notes',content:'Maintenance for a rotavator'}]);
 const equipment=buildSearchItems('equipment',[{id:'e',status:'published',title:'Soil Master',slug:'soil-master',category:'Rotary tillers',image:'javascript:alert(1)'}]);
 const dealers=buildSearchItems('dealers',[{id:'d',status:'published',name:'Farm Supply',slug:'farm-supply',brand:'Swaraj',city:'Pune',state:'Maharashtra'}]);
 const items=[...article,...equipment,...dealers];
 assert.equal(findSearchResults(items,'rotavator')[0].href,'/articles/field-notes');
 assert.equal(findSearchResults(items,'pune swar')[0].href,'/dealers/farm-supply');
 assert.equal(equipment[0].href,'/equipment/rotary-tillers/soil-master');
 assert.equal(equipment[0].image,'');
 assert.equal(buildSearchItems('articles',[{id:'broken',status:'published',title:'Missing slug'}]).length,0);
});

test('search loads published content beyond the old page limit and refreshes saved edits',async()=>{
 const search=load('services/search.ts');
 const fixtures=Array.from({length:31},(_,index)=>({id:'search-'+index,title:'Search fixture '+index,slug:'search-fixture-'+index,status:'published'}));
 fixtures[30].title='Unique late catalog entry';
 await local.writeLocal('articles',[...fixtures,{id:'draft-search',title:'Unpublished search secret',slug:'unpublished-search-secret',status:'draft'}]);
 let index=await search.loadSearchIndex();
 assert.ok(index.items.some(item=>item.title==='Unique late catalog entry'));
 assert.ok(!index.items.some(item=>item.id==='articles:draft-search'));
 fixtures[30].title='Updated late catalog entry';
 await local.writeLocal('articles',fixtures);
 index=await search.loadSearchIndex();
 assert.ok(index.items.some(item=>item.title==='Updated late catalog entry'));
 assert.ok(!index.items.some(item=>item.title==='Unique late catalog entry'));
 const fetchBefore=globalThis.fetch;
 globalThis.fetch=(input,init)=>String(input).includes('/api/local-cms/videos')?Promise.reject(new Error('Video store unavailable')):fetchBefore(input,init);
 try {
   const partial=await search.loadSearchIndex();
   assert.ok(partial.unavailable.includes('videos'));
   assert.ok(partial.items.some(item=>item.title==='Updated late catalog entry'));
 } finally { globalThis.fetch=fetchBefore; }
});

test('Firebase search paginates public records without relying on optional sort fields',async()=>{
 const requests=[];
 const fixtures=Array.from({length:201},(_,index)=>({id:String(index),data:()=>({status:'published',slug:'archive-'+index,title:'Archive article '+index})}));
 const firestore={
   collection:(_db,name)=>name,documentId:()=> '__name__',
   where:(...args)=>({kind:'where',args}),orderBy:(...args)=>({kind:'orderBy',args}),
   limit:(size)=>({kind:'limit',size}),startAfter:(cursor)=>({kind:'after',cursor}),
   query:(name,...constraints)=>({name,constraints}),
   getDocs:async request=>{
     requests.push(request);
     assert.deepEqual(request.constraints.find(item=>item.kind==='where').args,['status','==','published']);
     assert.deepEqual(request.constraints.find(item=>item.kind==='orderBy').args,['__name__']);
     if(request.name!=='articles')return {docs:[]};
     const cursor=request.constraints.find(item=>item.kind==='after')?.cursor;
     return {docs:cursor?fixtures.slice(Number(cursor.id)+1):fixtures.slice(0,200)};
   }
 };
 const testModule={exports:{}};
 const source=ts.transpileModule(fs.readFileSync(path.join(root,'services/search.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',source)(name=>{
   if(name==='firebase/firestore')return firestore;
   if(name==='@/lib/firebase/client')return {db:{},isLocalDemo:false};
   if(name==='@/lib/local-demo')return {};
   if(name==='@/utils/site-search')return load('utils/site-search.ts');
   throw new Error('Unexpected dependency '+name);
 },testModule,testModule.exports);
 const result=await testModule.exports.loadSearchIndex();
 assert.equal(result.items.length,201);
 assert.equal(result.unavailable.length,0);
 assert.ok(result.items.some(item=>item.title==='Archive article 200'));
 assert.equal(requests.filter(request=>request.name==='articles').length,2);
});

test('uploaded tractor specifications reach details and live comparisons, including clears and deletions',async()=>{
 const {parseTractorSpecificationCsv}=load('lib/tractor-specification-csv.ts');
 const {comparisonGroups,tractorSpecifications}=load('lib/tractor-specifications.ts');
 const {subscribeComparisonCatalog}=load('services/comparison.ts');
 const brandId=await admin.saveAdminRecord('brands',undefined,{title:'Specification QA'});
 const imported=parseTractorSpecificationCsv('field,value\nengineCapacityCc,2979\ncylinders,4\nptoHp,42\nliftingCapacityKg,1500\nfrontTyres,6.00 x 16\nfeatures,"Power steering\nCanopy (optional)"');
 const first=await admin.saveAdminRecord('tractors',undefined,{brandId,model:'Spec model one',horsepower:47,price:700000,...imported.values});
 const second=await admin.saveAdminRecord('tractors',undefined,{brandId,model:'Spec model two',horsepower:50,engineCapacityCc:3100,ptoHp:44,liftingCapacityKg:1800});
 const detail=await catalog.getTractorBySlugs('specification-qa','spec-model-one');
 assert.equal(detail.engineCapacityCc,2979);assert.deepEqual(detail.features,['Power steering','Canopy (optional)']);
 assert.equal(tractorSpecifications(detail).flatMap(group=>group.rows).find(row=>row.key==='ptoHp').value,'42 HP');
 const rows=comparisonGroups(await reviews.getTractorsByIds([first,second])).flatMap(group=>group.rows);
 assert.equal(rows.find(row=>row.key==='engineCapacityCc').different,true);
 const received=[];const errors=[];const stop=subscribeComparisonCatalog(items=>received.push(items),error=>errors.push(error));
 async function waitFor(predicate){const until=Date.now()+5000;while(!predicate()&&Date.now()<until)await new Promise(resolve=>setTimeout(resolve,40));assert.ok(predicate(),'comparison update delivered');}
 try {
   const saved=(await admin.listAdminRecords('tractors')).find(item=>item.id===first);
   await admin.saveAdminRecord('tractors',first,{...saved,ptoHp:'',engineCapacityCc:'',features:''});
   await waitFor(()=>received.some(items=>items.some(item=>item.id===first&&item.ptoHp==='')));
   const cleared=await catalog.getTractorBySlugs('specification-qa','spec-model-one');
   assert.deepEqual(cleared.features,[]);
   assert.equal(tractorSpecifications(cleared).flatMap(group=>group.rows).find(row=>row.key==='ptoHp').value,'Not provided');
   const records=await local.readLocal('tractors');
   await local.writeLocal('tractors',[...records,...Array.from({length:28},(_,index)=>({id:'bulk-compare-'+index,model:'Bulk '+index,brandName:'Specification QA',status:'published'})),{id:'hidden-compare',model:'Hidden',status:'draft'}]);
   await waitFor(()=>received.some(items=>items.length>=30));
   assert.ok(!received.at(-1).some(item=>item.id==='hidden-compare'));
   await admin.removeAdminRecord('tractors',first);
   await waitFor(()=>received.at(-1)?.every(item=>item.id!==first));
   assert.equal(errors.length,0);
 } finally {stop();}
});

test('every content module supports reopening, repeated partial edits and clearing optional fields',async()=>{
 const {prepareAdminForm,adminFormChanges}=load('lib/admin-form.ts');
 const brandId=await admin.saveAdminRecord('brands',undefined,{title:'Edit workflow brand'});
 const cases=[
  ['tractors',{brandId,model:'Editable model'},{description:'Details',ptoHp:42,features:['Power steering'],image:'/tractor.png',price:700000,maxPrice:750000,transmission:'Synchromesh'},{description:'',ptoHp:'',features:[],image:'',maxPrice:'',transmission:''}],
  ['brands',{title:'Editable brand'},{description:'Brand description',logo:'/brand.png'},{description:'',logo:''}],
  ['equipment',{title:'Editable implement'},{description:'Implement details',category:'Cultivators',price:40000,image:'/equipment.png'},{description:'',category:'',price:'',image:''}],
  ['articles',{title:'Editable article'},{content:'Full article',excerpt:'Summary',image:'/article.png'},{content:'',excerpt:'',image:''}],
  ['categories',{title:'Editable category'},{description:'Category text'},{description:''}],
  ['videos',{title:'Editable video',youtubeId:'abcdefghijk'},{youtubeId:'zyxwvutsrqp',description:'Video details',thumbnail:'/video.png'},{description:'',thumbnail:''}],
  ['dealers',{title:'Editable dealer'},{phone:'9876543210',address:'Dealer address',city:'Pune'},{phone:'',address:'',city:''}],
  ['banners',{title:'Editable campaign'},{image:'/campaign.png',ctaLabel:'Explore',ctaUrl:'/tractors'},{image:'',ctaLabel:'',ctaUrl:''}],
  ['hero-slides',{title:'Editable slide'},{image:'/slide.png',order:4},{image:'',order:''}],
  ['partners',{title:'Editable partner'},{image:'/partner.png',order:5},{image:'',order:''}],
  ['advertisements',{title:'Editable advertisement'},{image:'/ad.png',destinationUrl:'/brands'},{image:'',destinationUrl:''}],
  ['seo',{title:'Editable metadata',path:'/qa-edit'},{description:'Meta text',image:'/meta.png'},{description:'',image:''}],
  ['settings',{key:'tagline'},{value:'Site tagline'},{value:''}],
  ['homepage',{key:'youtube'},{title:'Edited YouTube section',visible:false,order:9},{title:'',visible:true,order:''}],
 ];
 for(const [sectionKey,initial,patch,clears] of cases){
  const section=sections[sectionKey];const name=section.collection;
  const id=await admin.saveAdminRecord(name,undefined,initial);
  const first=await admin.getAdminRecord(name,id);assert.ok(first,sectionKey+' exists');
  const reopened=prepareAdminForm(section,first);
  const changes=adminFormChanges(section,reopened,{...reopened,...patch});
  assert.equal(await admin.saveAdminRecord(name,id,changes,first),id);
  const second=await admin.getAdminRecord(name,id);
  for(const [key,value] of Object.entries(patch))assert.deepEqual(second[key],value,sectionKey+' saves '+key);
  assert.equal(second.createdAt,first.createdAt);assert.equal(second.slug,first.slug);
  await admin.saveAdminRecord(name,id,clears,second);
  const third=await admin.getAdminRecord(name,id);
  for(const [key,value] of Object.entries(clears))if(key!=='order')assert.deepEqual(third[key],value,sectionKey+' clears '+key);
  if('order' in clears)assert.equal(third.order,second.order);
  const finalForm=prepareAdminForm(section,third);
  await admin.saveAdminRecord(name,id,adminFormChanges(section,finalForm,finalForm),third);
  assert.equal((await admin.listAdminRecords(name)).filter(item=>item.id===id).length,1,sectionKey+' must update, not duplicate');
  await admin.removeAdminRecord(name,id);
 }
 await admin.removeAdminRecord('brands',brandId);
});

test('edits preserve stable URLs, replace equipment categories, and reject stale or deleted records',async()=>{
 const id=await admin.saveAdminRecord('equipment',undefined,{title:'Original implement name',category:'Ploughs',image:'/original.png'});
 const original=await admin.getAdminRecord('equipment',id);
 await admin.saveAdminRecord('equipment',id,{title:'New implement name',category:'Rotary tillers'},original);
 const updated=await media.getEquipment('rotary-tillers','original-implement-name');
 assert.equal(updated.name,'New implement name');assert.equal(updated.image,'/original.png');
 assert.equal(await media.getEquipment('ploughs','original-implement-name'),null);
 await assert.rejects(admin.saveAdminRecord('equipment',id,{description:'Stale tab edit'},original),/changed since you opened/);
 assert.equal((await admin.getAdminRecord('equipment',id)).description,'');
 await admin.removeAdminRecord('equipment',id);
 await assert.rejects(admin.saveAdminRecord('equipment',id,{title:'Do not resurrect'}),/removed/);
 assert.equal(await admin.getAdminRecord('equipment',id),null);
});

test('old saved values and missing references survive unrelated edits without data loss',async()=>{
 await local.writeLocal('equipment',[{id:'legacy-equipment',name:'Legacy equipment',slug:'legacy-equipment',categoryName:'Ploughs',categorySlug:'ploughs',image:'/legacy.png',status:'published',createdAt:'2020-01-01'}]);
 await admin.saveAdminRecord('equipment','legacy-equipment',{description:'New description'});
 const equipment=await media.getEquipment('ploughs','legacy-equipment');
 assert.equal(equipment.name,'Legacy equipment');assert.equal(equipment.image,'/legacy.png');assert.equal(equipment.description,'New description');
 const existingTractors=await local.readLocal('tractors');
 await local.writeLocal('tractors',[...existingTractors,{id:'legacy-tractor',brandId:'legacy-missing-brand',brandName:'Legacy brand',modelName:'Legacy model',slug:'legacy-model',hp:0,priceMin:500000,thumbnail:'/old-tractor.png',status:'published'}]);
 await admin.saveAdminRecord('tractors','legacy-tractor',{description:'Updated legacy tractor'});
 const tractor=await admin.getAdminRecord('tractors','legacy-tractor');
 assert.equal(tractor.brandName,'Legacy brand');assert.equal(tractor.brandId,'legacy-missing-brand');assert.equal(tractor.model,'Legacy model');assert.equal(tractor.image,'/old-tractor.png');assert.equal(tractor.minPrice,500000);
 await admin.saveAdminRecord('tractors','legacy-tractor',{image:'',horsepower:'',description:''});
 const cleared=await admin.getAdminRecord('tractors','legacy-tractor');assert.equal(cleared.image,'');assert.equal(cleared.hp,0);assert.equal(cleared.description,'');
});

test('inbox, archived subscribers and lead details can be re-edited without losing workflow metadata',async()=>{
 await publicContent.submitContact({name:'Edit inbox',email:'original@example.test',phone:'9876543210',message:'Original enquiry'});
 const contact=(await admin.listAdminRecords('contactMessages')).find(item=>item.name==='Edit inbox');
 await admin.saveAdminRecord('contactMessages',contact.id,{phone:'',message:'Corrected enquiry'},contact);
 const inbox=await admin.getAdminRecord('contactMessages',contact.id);assert.equal(inbox.status,'New');assert.equal(inbox.email,contact.email);assert.equal(inbox.message,'Corrected enquiry');assert.equal(inbox.phone,'');
 await admin.saveAdminRecord('contactMessages',contact.id,{message:'Second correction'},inbox);
 assert.equal((await admin.getAdminRecord('contactMessages',contact.id)).message,'Second correction');
 await assert.rejects(admin.saveAdminRecord('contactMessages',undefined,{name:'Fake enquiry'}),/received through/);
 await publicContent.subscribeNewsletter('archive@example.test');
 const subscriber=(await admin.listAdminRecords('newsletterSubscribers')).find(item=>item.email==='archive@example.test');
 await admin.saveAdminRecord('newsletterSubscribers',subscriber.id,{email:'corrected@example.test'});
 assert.equal((await admin.getAdminRecord('newsletterSubscribers',subscriber.id)).email,'corrected@example.test');
 await leads.createLead({name:'Edit lead',phone:'9876543210',city:'Pune',state:'MH',source:'tractor-page',email:'lead@example.test',message:'Original message'});
 const lead=(await leads.listLeads({})).find(item=>item.name==='Edit lead');
 await leads.updateLeadStatus(lead.id,'Interested');await leads.updateLeadNotes(lead.id,'Keep these notes');
 await leads.updateLeadDetails(lead.id,{name:'Corrected lead',phone:'9876543211',email:'',city:'',state:'',message:'Updated message',source:'forged',userId:'forged'});
 const edited=(await leads.listLeads({})).find(item=>item.id===lead.id);
 assert.equal(edited.name,'Corrected lead');assert.equal(edited.phone,'9876543211');assert.equal(edited.email,'');assert.equal(edited.city,'');assert.equal(edited.source,'tractor-page');assert.equal(edited.status,'Interested');assert.equal(edited.notes,'Keep these notes');assert.equal(edited.createdAt,lead.createdAt);assert.equal(edited.userId,undefined);
 await leads.updateLeadDetails(lead.id,{message:''});assert.equal((await leads.listLeads({})).find(item=>item.id===lead.id).message,'');
 await assert.rejects(leads.updateLeadDetails(lead.id,{phone:''}),/phone/);
 await leads.deleteLead(lead.id);await assert.rejects(leads.updateLeadDetails(lead.id,{name:'Removed lead'}),/removed/);
});

test('Firebase admin lists older records beyond 100 and transaction edits preserve fields',async()=>{
 const rows=new Map(Array.from({length:205},(_,index)=>[String(index).padStart(3,'0'),{title:'Equipment '+index,name:'Equipment '+index,slug:'equipment-'+index,category:'Ploughs',categorySlug:'ploughs',status:'published',description:'Original',createdAt:'2020-01-01'}]));
 const requests=[];let mutateBeforeTransaction=false;
 const snapshot=id=>({id,exists:()=>rows.has(id),data:()=>({...rows.get(id)})});
 const firestore={
  collection:(_db,name)=>name,doc:(_db,name,id)=>({name,id}),documentId:()=> '__name__',
  orderBy:(...args)=>({kind:'orderBy',args}),limit:size=>({kind:'limit',size}),startAfter:cursor=>({kind:'after',cursor}),
  query:(name,...constraints)=>({name,constraints}),serverTimestamp:()=> '2026-08-28',
  getDocs:async request=>{
   requests.push(request);assert.deepEqual(request.constraints.find(item=>item.kind==='orderBy').args,['__name__']);
   const after=request.constraints.find(item=>item.kind==='after')?.cursor.id;
   return {docs:[...rows.keys()].sort().filter(id=>!after||id>after).slice(0,200).map(snapshot)};
  },
  getDoc:async target=>snapshot(target.id),
  runTransaction:async(_db,handler)=>{
   if(mutateBeforeTransaction){rows.set('204',{...rows.get('204'),description:'Other administrator changed this'});mutateBeforeTransaction=false;}
   return handler({get:async target=>snapshot(target.id),update:(target,payload)=>rows.set(target.id,{...rows.get(target.id),...payload})});
  },
 };
 const testModule={exports:{}};
 const compiled=ts.transpileModule(fs.readFileSync(path.join(root,'services/admin.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',compiled)(name=>{
  if(name==='firebase/firestore')return firestore;
  if(name==='firebase/storage')return {};
  if(name==='@/lib/firebase/client')return {db:{},storage:null,isLocalDemo:false};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
  throw new Error('Unexpected dependency '+name);
 },testModule,testModule.exports);
 const service=testModule.exports;
 const all=await service.listAdminRecords('equipment');assert.equal(all.length,205);assert.equal(all.at(-1).id,'204');assert.equal(requests.length,2);
 const original=await service.getAdminRecord('equipment','204');
 await service.saveAdminRecord('equipment','204',{title:'Renamed late record',description:''},original);
 const edited=await service.getAdminRecord('equipment','204');assert.equal(edited.name,'Renamed late record');assert.equal(edited.slug,'equipment-204');assert.equal(edited.categoryName,'Ploughs');assert.equal(edited.description,'');assert.equal(edited.createdAt,'2020-01-01');
 mutateBeforeTransaction=true;
 await assert.rejects(service.saveAdminRecord('equipment','204',{description:'My edit'},edited),/changed since you opened/);
 assert.equal(rows.get('204').description,'Other administrator changed this');
 rows.delete('204');await assert.rejects(service.saveAdminRecord('equipment','204',{description:'Restore deleted'}),/removed/);
});

test('homepage tractor flags can be added and re-edited and update the public catalog',async()=>{
 const {selectShowcaseTractors}=load('lib/tractor-showcase.ts');
 const brandId=await admin.saveAdminRecord('brands',undefined,{title:'Showcase brand'});
 const id=await admin.saveAdminRecord('tractors',undefined,{brandId,model:'Showcase model',popular:true,inDemand:true,horsepower:47,engineCapacityCc:2979});
 let saved=await admin.getAdminRecord('tractors',id);assert.equal(saved.popular,true);assert.equal(saved.inDemand,true);
 const published=await reviews.getTractorsByIds([id]);assert.equal(selectShowcaseTractors(published,'popular').length,1);assert.equal(published[0].engineCapacityCc,2979);
 await admin.saveAdminRecord('tractors',id,{popular:false,inDemand:false,upcoming:true},saved);
 saved=await admin.getAdminRecord('tractors',id);assert.equal(saved.inDemand,false);assert.equal(saved.popular,false);
 const updated=await reviews.getTractorsByIds([id]);assert.equal(selectShowcaseTractors(updated,'popular').length,0);assert.equal(selectShowcaseTractors(updated,'latest').length,0);assert.equal(selectShowcaseTractors(updated,'upcoming').length,1);
 await admin.saveAdminRecord('tractors',id,{upcoming:false},saved);assert.equal(selectShowcaseTractors(await reviews.getTractorsByIds([id]),'latest').length,1);
 await admin.removeAdminRecord('tractors',id);await admin.removeAdminRecord('brands',brandId);
});
