import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
const root=fileURLToPath(new URL('..',import.meta.url));
const require=createRequire(import.meta.url);
function load(name){
 const filename=path.resolve(root,name);const mod={exports:{}};
 const source=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',source)(specifier=>{
  if(specifier.startsWith('@/'))return load(specifier.slice(2)+'.ts');
  if(specifier.startsWith('.'))return load(path.resolve(path.dirname(filename),specifier)+'.ts');
  return require(specifier);
 },mod,mod.exports);return mod.exports;
}
const {heroImageSource,sortHeroSlides,prepareAdminRecord}=load('lib/admin-records.ts');

test('image URLs remain intact, with no default banner fallback', () => {
  const data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
  const signed = 'https://example.com/image.png?token=123&alt=media';
  assert.equal(heroImageSource(data), data);
  assert.equal(heroImageSource(signed), signed);
  assert.equal(heroImageSource('/api/local-media/test.png'), '/api/local-media/test.png');
  assert.equal(heroImageSource(''), '');
  assert.equal(heroImageSource('javascript:alert(1)'), '');
});
test('published slides sort by position and preserve intentional blanks', () => {
  const result = sortHeroSlides([
    { id: 'second', order: 2, status: 'published', image: '' },
    { id: 'draft', order: 1, status: 'draft' },
    { id: 'first', order: 1, status: 'published', image: '/one.png' }
  ]);
  assert.deepEqual(result.map(item => item.id), ['first', 'second']);
  assert.equal(result[1].image, '');
  assert.deepEqual(sortHeroSlides([]), []);
});
test('slugs use the complete title and existing slugs stay stable', () => {
  assert.equal(prepareAdminRecord('articles', { title: 'A complete tractor guide' }).slug, 'a-complete-tractor-guide');
  assert.equal(prepareAdminRecord('articles', { title: 'Updated guide', slug: 'original-guide' }).slug, 'original-guide');
});
test('admin field names match public content fields', () => {
  const tractor = prepareAdminRecord('tractors', { brand: 'Mahindra', model: '575 DI', horsepower: 47, price: 720000 });
  assert.equal(tractor.hp, 47);
  assert.equal(tractor.minPrice, 720000);
  assert.equal(tractor.brandSlug, 'mahindra');
  assert.ok(tractor.searchTerms.includes('mahindra 575 di'));
  const article = prepareAdminRecord('articles', { title: 'Guide', image: '/new.png', content: 'Body' });
  assert.equal(article.coverImage, '/new.png');
  assert.equal(article.body, 'Body');
  assert.equal(prepareAdminRecord('brands', { title: 'Swaraj' }).name, 'Swaraj');
  assert.equal(prepareAdminRecord('reviews', { rating: 5 }).status, 'approved');
});
test('slide positions must be positive whole numbers', () => {
  for (const order of [0, -1, 1.5, NaN]) assert.throws(() => prepareAdminRecord('heroSlides', { title: 'Banner', order }));
  assert.equal(prepareAdminRecord('heroSlides', { title: 'Banner', order: 1, image: '' }).image, '');
});

test('tractor specifications normalize numbers and feature lists and reject impossible inputs',()=>{
  const input={brand:'QA',model:'Model',variant:'4WD',horsepower:'47',engineCapacityCc:'2979',cylinders:'4',forwardGears:'8',reverseGears:0,features:'Power steering\n Optional canopy\nPower steering',compatibleImplements:'Rotary tiller',ptoHp:'42',price:700000,maxPrice:750000};
  const saved=prepareAdminRecord('tractors',input);
  assert.equal(saved.engineCapacityCc,2979);assert.equal(saved.hp,47);
  assert.equal(saved.reverseGears,0);assert.equal(saved.slug,'model-4wd');
  assert.deepEqual(saved.features,['Power steering','Optional canopy']);
  assert.deepEqual(saved.compatibleImplements,['Rotary tiller']);
  assert.throws(()=>prepareAdminRecord('tractors',{...input,cylinders:2.5}),/whole number/);
  assert.throws(()=>prepareAdminRecord('tractors',{...input,engineCapacityCc:-100}),/number/);
  assert.throws(()=>prepareAdminRecord('tractors',{...input,ptoHp:Infinity}),/number/);
  assert.throws(()=>prepareAdminRecord('tractors',{...input,driveType:'6WD'}),/valid drive/);
  assert.throws(()=>prepareAdminRecord('tractors',{...input,maxPrice:600000}),/Maximum price|maximum price/);
  assert.throws(()=>prepareAdminRecord('tractors',{...input,specificationSourceUrl:'javascript:alert(1)'}),/URL/);
  assert.equal(prepareAdminRecord('tractors',{brand:'QA',model:'Legacy',hp:0}).hp,0);
});

test('CSV specifications accept quoted multiline text and do not clear blank or unrelated fields',()=>{
  const {parseTractorSpecificationCsv,tractorSpecificationTemplate}=load('lib/tractor-specification-csv.ts');
  const imported=parseTractorSpecificationCsv('\uFEFFfield,value\r\n"Engine displacement (cc)",2979\r\n"Key features","Power steering\nCanopy, optional"\r\n"TorqueNm",\r\n');
  assert.equal(imported.values.engineCapacityCc,2979);
  assert.deepEqual(imported.values.features,['Power steering','Canopy, optional']);
  assert.ok(!('torqueNm' in imported.values));assert.equal(imported.skipped,1);
  assert.ok(tractorSpecificationTemplate().includes('Engine power (HP)'));
  for(const csv of ['field,value\nstatus,published','field,value\ncylinders,2.5','field,value\nptoHp,42 HP','field,value\nhp,47\nhorsepower,48','field,value\nfeatures,"unclosed'])assert.throws(()=>parseTractorSpecificationCsv(csv));
  assert.throws(()=>parseTractorSpecificationCsv(tractorSpecificationTemplate()),/no filled/);
  assert.throws(()=>parseTractorSpecificationCsv('field,value\nfeatures,'+'a'.repeat(66000)),/64 KB/);
});

test('comparison slots preserve order, reject duplicate models and round-trip share links',()=>{
  const {comparisonSelection,chooseComparisonTractor,comparisonUrl}=load('lib/tractor-comparison.ts');
  const slots=chooseComparisonTractor(['first','',''],2,'third');
  assert.deepEqual(slots,['first','','third']);
  assert.deepEqual(chooseComparisonTractor(slots,1,'first'),slots);
  const url=comparisonUrl(slots);
  assert.deepEqual(comparisonSelection(new URL(url,'https://example.test').searchParams.getAll('tractor')),slots);
  assert.deepEqual(comparisonSelection(['first','first','third','fourth']),['first','','third']);
  assert.deepEqual(chooseComparisonTractor(slots,0,''),['','','third']);
});

test('comparison uses units, handles unknown values and only marks known differences',()=>{
  const {comparisonGroups,tractorPrice}=load('lib/tractor-specifications.ts');
  const a={brandName:'QA',hp:47,ptoHp:42,engineCapacityCc:'',minPrice:0,maxPrice:0,reverseGears:0,features:['Canopy','Power steering']};
  const b={...a,hp:50,ptoHp:'',features:['Power steering','Canopy']};
  const groups=comparisonGroups([a,b]);const rows=groups.flatMap(group=>group.rows);
  assert.deepEqual(rows.find(row=>row.key==='horsepower').values,['47 HP','50 HP']);
  assert.deepEqual(rows.find(row=>row.key==='engineCapacityCc').values,['Not provided','Not provided']);
  assert.deepEqual(rows.find(row=>row.key==='reverseGears').values,['0','0']);
  assert.equal(rows.find(row=>row.key==='ptoHp').different,false);
  assert.equal(rows.find(row=>row.key==='features').different,false);
  assert.deepEqual(comparisonGroups([a,b],true).flatMap(group=>group.rows.map(row=>row.key)),['horsepower']);
  assert.equal(tractorPrice(a),'Not provided');
});

test('admin edit forms retain saved aliases, explicit blanks and unavailable references',()=>{
 const {prepareAdminForm,adminFormChanges,adminSelectOptions}=load('lib/admin-form.ts');
 const {adminSections}=load('config/admin-sections.ts');
 const tractor={id:'legacy',brandId:'missing-brand',modelName:'Legacy model',hp:45,priceMin:600000,priceMax:700000,thumbnail:'/saved.png',features:['Canopy','Hydraulics'],slug:'stable-url'};
 const form=prepareAdminForm(adminSections.tractors,tractor);
 assert.equal(form.model,'Legacy model');assert.equal(form.horsepower,45);assert.equal(form.price,600000);assert.equal(form.maxPrice,700000);assert.equal(form.image,'/saved.png');assert.equal(form.brandId,'missing-brand');
 assert.equal(adminSelectOptions(adminSections.tractors.fields[0],form.brandId,{}).at(0).value,'missing-brand');
 assert.deepEqual(adminFormChanges(adminSections.tractors,form,{...form,features:[],image:'',ptoHp:42}),{image:'',ptoHp:42,features:[]});
 const cleared=prepareAdminForm(adminSections.tractors,{...tractor,image:'',horsepower:'',features:[]});
 assert.equal(cleared.image,'');assert.equal(cleared.horsepower,'');assert.deepEqual(cleared.features,[]);
 const equipment=prepareAdminForm(adminSections.equipment,{id:'e',name:'Plough',categoryName:'Tillage'});
 assert.equal(equipment.title,'Plough');assert.equal(equipment.category,'Tillage');
 const article=prepareAdminForm(adminSections.articles,{id:'a',title:'Article',body:'Existing body',coverImage:'/existing.png'});
 assert.equal(article.content,'Existing body');assert.equal(article.image,'/existing.png');
 const video=prepareAdminForm(adminSections.videos,{id:'v',title:'Video',youtubeVideoId:'abcdefghijk'});
 assert.equal(video.youtubeId,'abcdefghijk');
});

test('only essential identifying fields are mandatory and field changes exclude metadata',()=>{
 const {adminSections}=load('config/admin-sections.ts');
 const {prepareAdminForm,adminFormChanges,sameAdminRecord}=load('lib/admin-form.ts');
 assert.deepEqual(adminSections.tractors.fields.filter(field=>field.required).map(field=>field.key),['brandId','model']);
 for(const key of ['hero-slides','partners'])assert.deepEqual(adminSections[key].fields.filter(field=>field.required).map(field=>field.key),['title']);
 assert.equal(adminSections.articles.fields.find(field=>field.key==='articleType').required,undefined);
 const current={id:'a',title:'Original',description:'Optional',slug:'original',createdAt:'old'};
 const form=prepareAdminForm(adminSections.brands,current);
 assert.deepEqual(adminFormChanges(adminSections.brands,form,{...form,title:'Renamed',description:'',slug:'different',id:'other'}),{title:'Renamed',description:''});
 assert.deepEqual(adminFormChanges(adminSections.brands,form,form),{});
 assert.equal(sameAdminRecord({a:1,b:{c:2}},{b:{c:2},a:1}),true);
 assert.equal(sameAdminRecord({a:1},{a:2}),false);
});

test('optional maximum price and transmission remain blank after clearing',()=>{
 const saved=prepareAdminRecord('tractors',{brand:'QA',model:'Optional model',price:700000,maxPrice:'',transmission:''});
 assert.equal(saved.maxPrice,'');assert.equal(saved.transmission,'');
 const missing=prepareAdminRecord('tractors',{brand:'QA',model:'Optional model',price:700000});
 assert.equal(missing.maxPrice,'');assert.equal(missing.transmission,'');
 assert.throws(()=>prepareAdminRecord('tractors',{brand:'QA',model:'Invalid price',price:700000,maxPrice:600000}),/maximum price/);
});
