import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const require=createRequire(import.meta.url);
const source=ts.transpileModule(fs.readFileSync(new URL('../components/HomepageSections.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const testModule={exports:{}};
new Function('require','module','exports',source)(name=>{
  if(name.endsWith('.css'))return {};
  if(name==='@/components/LocalizedElement')return {LocalizedElement:({as,children,...props})=>React.createElement(as,props,children)};
  if(name==='@/lib/partner-scroll')return loadShowcase('lib/partner-scroll.ts');
  if(name==='./FavouriteButton')return {FavouriteButton:props=>React.createElement('button',{'data-favourite':props.itemId},'Save '+props.title)};
  return require(name);
},testModule,testModule.exports);
const {HomeTractors,HomeArticles,HomePartners,HomeBrands,HomeVideos,HomeCompare}=testModule.exports;
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props));

test('empty homepage catalog offers real power filters without inventing listings',()=>{
 const html=render(HomeTractors,{title:'Your catalog title',tractors:[]});
 assert.ok(html.includes('Your catalog title'));
 assert.ok(html.includes('/tractors?minHp=0&amp;maxHp=29'));
 assert.ok(html.includes('/tractors?minHp=61'));
 assert.ok(html.includes('New models appear here when they are published.'));
 assert.ok(!html.includes('href="/tractor/'));
 assert.equal(render(HomeBrands,{title:'Brands',brands:[],tractors:[]}), '');
 assert.equal(render(HomeVideos,{title:'Videos',videos:[]}), '');
});

test('homepage tractor cards preserve model links and do not display fabricated zero prices',()=>{
 const base={id:'a',name:'First model',brandName:'Actual brand',brandSlug:'actual-brand',slug:'first-model',hp:45,minPrice:0,maxPrice:0,image:'',condition:'new',transmission:'Manual'};
 const html=render(HomeTractors,{title:'Tractors',tractors:[base,{...base,id:'b',name:'Second model',slug:'second-model',minPrice:700000,maxPrice:750000}]});
 assert.ok(html.includes('/tractor/actual-brand/first-model'));
 assert.ok(html.includes('/compare?tractor=b'));
 assert.ok(html.includes('Price not listed'));
 assert.ok(!html.includes('₹0'));
 assert.ok(html.includes('₹7.00 Lakh – ₹7.50 Lakh'));
 assert.ok(html.includes('aria-hidden="true" inert=""'));
 assert.equal((html.match(/data-favourite=/g)||[]).length,2);
});

test('editorial cards use supplied content while an empty library offers section links',()=>{
 const empty=render(HomeArticles,{title:'Knowledge',articles:[]});
 for(const href of ['/articles','/equipment','/news'])assert.ok(empty.includes(`href="${href}"`));
 assert.ok(!empty.includes('href="/articles/'));
 assert.equal((empty.match(/class="home-reading-index"/g)||[]).length,3);
 for(const number of ['01','02','03'])assert.ok(empty.includes(`>${number}</span>`));
 const html=render(HomeArticles,{title:'Knowledge',articles:[{id:'a',title:'Saved <story>',slug:'saved-story',excerpt:'Published excerpt'}]});
 assert.ok(html.includes('href="/articles/saved-story"'));
 assert.ok(html.includes('Saved &lt;story&gt;'));
 assert.ok(html.includes('Published excerpt'));
});

test('homepage comparison section renders the selected four-card grid and working action',()=>{
 const html=render(HomeCompare,{title:'Compare the details. Make a confident choice.'});
 assert.ok(html.includes('Compare the details. Make a confident choice.'));
 assert.ok(html.includes('href="/compare"'));
 assert.equal((html.match(/class="home-compare-card"/g)||[]).length,4);
 for(const label of ['Power &amp; performance','Engine','Transmission','Features'])assert.ok(html.includes(label));
 assert.ok(!html.includes('home-comparison-art'));
});

test('partner strip repeats saved logos while exposing their names only once',()=>{
 assert.equal(render(HomePartners,{title:'Partners',partners:[]}), '');
 const partners=Array.from({length:9},(_,index)=>({id:String(index+1),title:'Partner '+(index+1),image:'/partner-'+(index+1)+'.png'}));
 const html=render(HomePartners,{title:'Partner logos',partners});
 assert.ok(html.includes('aria-label="Partner logos"'));
 assert.ok(html.includes('class="home-partner-track"'));
 assert.ok(!html.includes('<button'));
 assert.ok(!html.includes('tabindex='));
 assert.deepEqual(Array.from(html.matchAll(/alt="Partner (\d+)"/g),match=>Number(match[1])),[1,2,3,4,5,6,7,8,9]);
 assert.ok(html.includes('aria-hidden="true" inert=""'));
 assert.equal((html.match(/class="home-partner-group"/g)||[]).length,2);
 assert.ok(!html.includes('models'));
 const edited=render(HomePartners,{title:'Partner logos',partners:[{...partners[8],image:'/updated.png'},partners[0]]});
 assert.ok(edited.includes('src="/updated.png"'));
 assert.ok(!edited.includes('src="/partner-9.png"'));
 assert.deepEqual(Array.from(edited.matchAll(/alt="Partner (\d+)"/g),match=>Number(match[1])),[9,1]);
});

test('partner loop fills mobile and wide viewports with no empty tail at the seam',()=>{
 const {partnerScrollMetrics}=loadShowcase('lib/partner-scroll.ts');
 assert.deepEqual(partnerScrollMetrics(472,984),{loopWidth:984,copies:2});
 assert.deepEqual(partnerScrollMetrics(1200,984),{loopWidth:984,copies:3});
 assert.deepEqual(partnerScrollMetrics(2060,200),{loopWidth:200,copies:12});
 assert.deepEqual(partnerScrollMetrics(472,0),{loopWidth:0,copies:2});
 for(const viewport of [320,472,768,1440,2560])for(const group of [128,768,1050]){
  const {loopWidth,copies}=partnerScrollMetrics(viewport,group);
  assert.ok((copies-1)*loopWidth>=viewport);
 }
});

function loadShowcase(relative){
 const source=ts.transpileModule(fs.readFileSync(new URL('../'+relative,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const loaded={exports:{}};
 new Function('require','module','exports',source)(name=>{
  if(name.endsWith('.css'))return {};
  if(name==='@/components/LocalizedElement')return {LocalizedElement:({as,children,...props})=>React.createElement(as,props,children)};
  if(name.startsWith('@/'))return loadShowcase(name.slice(2)+'.ts');
  if(name.startsWith('./'))return loadShowcase(relative.slice(0,relative.lastIndexOf('/')+1)+name.slice(2)+'.ts');
  return require(name);
 },loaded,loaded.exports);return loaded.exports;
}
const {TractorShowcase,ShowcaseTractorCard}=loadShowcase('components/TractorShowcase.tsx');
const {selectShowcaseTractors,tractorShowcaseLinks}=loadShowcase('lib/tractor-showcase.ts');
const showcaseBase={id:'one',name:'Actual tractor',slug:'actual-tractor',brandSlug:'actual-brand',brandId:'brand',brandName:'Actual brand',hp:47,engineCapacityCc:2979,status:'published',condition:'new',popular:true,upcoming:false,inDemand:true,image:'/catalog-image.png',createdAt:'2026-08-01'};

test('reference tractor section renders five cards, real specifications and correct price links',()=>{
 const tractors=Array.from({length:7},(_,index)=>({...showcaseBase,id:String(index),name:'Tractor '+index,slug:'tractor-'+index,inDemand:index===0}));
 const html=render(TractorShowcase,{title:'Tractors in 2026',tractors});
 assert.ok(html.includes('Tractors in 2026'));assert.equal((html.match(/class="showcase-tractor-card"/g)||[]).length,5);
 assert.equal((html.match(/role="tab"/g)||[]).length,3);assert.ok(html.includes('aria-selected="true"'));
 assert.ok(html.includes('47 HP'));assert.ok(html.includes('2979 CC'));
 assert.ok(html.includes('/tractor/actual-brand/tractor-0#price'));assert.ok(html.includes('View All Popular Tractors'));
 assert.ok(html.includes('href="/tractors?view=popular"'));assert.equal((html.match(/class="showcase-demand"/g)||[]).length,1);
});

test('showcase tabs use saved classifications, exclude unpublished and used models and sort latest by creation',()=>{
 const rows=[showcaseBase,{...showcaseBase,id:'latest',popular:false,createdAt:{seconds:1790000000}}, {...showcaseBase,id:'coming',upcoming:true}, {...showcaseBase,id:'used',condition:'used'}, {...showcaseBase,id:'draft',status:'draft'}, {...showcaseBase,id:'older',createdAt:'2020-01-01',popularityScore:9}, {...showcaseBase}];
 assert.deepEqual(selectShowcaseTractors(rows,'popular').map(row=>row.id),['older','one']);
 assert.deepEqual(selectShowcaseTractors(rows,'latest').map(row=>row.id),['latest','one','older']);
 assert.deepEqual(selectShowcaseTractors(rows,'upcoming').map(row=>row.id),['coming']);
 assert.equal(rows.length,7);assert.equal(tractorShowcaseLinks.latest,'/new-tractors');assert.equal(tractorShowcaseLinks.upcoming,'/upcoming-tractors');
});

test('selected homepage design renders five CMS cards with working specification links',()=>{
 const tractors=Array.from({length:6},(_,index)=>({...showcaseBase,id:String(index),slug:'tractor-'+index,name:'Saved tractor '+index}));
 const html=render(TractorShowcase,{title:'Tractors in 2026',tractors,design:'reference'});
 assert.equal((html.match(/class="showcase-tractor-card"/g)||[]).length,5);
 assert.ok(html.includes('View specifications'));
 assert.ok(html.includes('href="/tractor/actual-brand/tractor-3"'));
 assert.ok(html.includes('Saved tractor 4'));assert.ok(!html.includes('Saved tractor 5'));
});

test('video section supports a configured channel when empty and actual saved videos when published',()=>{
 const empty=render(HomeVideos,{title:'In the field',videos:[],channelUrl:'https://www.youtube.com/@ConfiguredChannel'});
 assert.ok(empty.includes('No videos have been added'));
 assert.ok(empty.includes('href="https://www.youtube.com/@ConfiguredChannel"'));
 assert.ok(!empty.includes('href="/videos/'));
 const videos=Array.from({length:11},(_,index)=>({id:'v'+(index+1),title:'Saved demonstration '+(index+1),slug:'saved-demonstration-'+(index+1),thumbnail:'/uploaded-video-'+(index+1)+'.jpg'}));
 const live=render(HomeVideos,{title:'In the field',videos,channelUrl:'https://www.youtube.com/@ConfiguredChannel'});
 assert.equal((live.match(/class="home-video-card"/g)||[]).length,10);
 assert.ok(live.includes('href="/videos/saved-demonstration-1"'));
 assert.ok(live.includes('href="/videos/saved-demonstration-9"'));
 assert.ok(live.includes('href="/videos/saved-demonstration-10"'));
 assert.ok(live.includes('src="/uploaded-video-1.jpg"'));
 assert.ok(!live.includes('class="home-play"'));
 assert.ok(live.includes('player-play.svg'));
 assert.ok(!live.includes('>YOUTUBE<'));
 assert.ok(!live.includes('>Watch video'));
 assert.ok(live.includes('class="home-video-channel"'));
 assert.ok(live.includes('href="https://www.youtube.com/@ConfiguredChannel"'));
});

test('new hero uses the saved image, clears removed slides and keeps functional search',()=>{
 const {HomepageHero}=loadShowcase('components/HomepageHero.tsx');
 const props={title:'Find the tractor that fits your work.',slides:[{id:'1',image:'/saved-hero.jpg',title:'Saved banner'}],index:0,onSlide:()=>{},brands:[{id:'b',name:'Actual brand'}]};
 const live=render(HomepageHero,props);
 assert.ok(live.includes('src="/saved-hero.jpg"'));
 assert.ok(live.includes('Search tractor, brand or model'));assert.ok(live.includes('Under 40 HP'));
 const removed=render(HomepageHero,{...props,slides:[]});
 assert.ok(!removed.includes('/saved-hero.jpg'));assert.ok(removed.includes('src="/hero/tractor-hero-cinematic.png"'));
 assert.ok(removed.includes('Find the tractor that fits your work.'));
 const edited=render(HomepageHero,{...props,slides:[{id:'1',image:'/updated-hero.jpg'}]});
 assert.ok(edited.includes('/updated-hero.jpg'));assert.ok(!edited.includes('/saved-hero.jpg'));
});

test('homepage finder submits the catalog brand and horsepower contract',()=>{
 const {homepageFinderUrl}=loadShowcase('components/HomepageHero.tsx');
 assert.equal(homepageFinderUrl('', ''), '/tractors?condition=new');
 assert.equal(homepageFinderUrl('brand & one', '30:45'), '/tractors?condition=new&brand=brand+%26+one&minHp=30&maxHp=45');
 assert.equal(homepageFinderUrl('', '61'), '/tractors?condition=new&minHp=61');
 assert.equal(homepageFinderUrl('', 'unrecognized'), '/tractors?condition=new');
});

test('homepage hero search submits the catalog search contract',()=>{
 const {homepageSearchUrl}=loadShowcase('components/HomepageHero.tsx');
 assert.equal(homepageSearchUrl(''), '/tractors?condition=new');
 assert.equal(homepageSearchUrl('  Mahindra 575  '), '/tractors?condition=new&search=Mahindra+575');
});

test('showcase has honest empty, loading and error states without fabricated specifications or badges',()=>{
 const empty=render(TractorShowcase,{title:'Tractors',tractors:[]});assert.ok(empty.includes('No popular tractors listed yet.'));assert.ok(!empty.includes('class="showcase-tractor-card"'));
 const loading=render(TractorShowcase,{title:'Tractors',tractors:[],loading:true});assert.ok(loading.includes('Loading tractors'));assert.ok(!loading.includes('No popular'));
 const error=render(TractorShowcase,{title:'Tractors',tractors:[showcaseBase],error:'Unavailable',onRetry:()=>{}});assert.ok(error.includes('Try again'));assert.ok(!error.includes('class="showcase-tractor-card"'));
 const missing=render(ShowcaseTractorCard,{tractor:{...showcaseBase,hp:0,engineCapacityCc:'',image:'',inDemand:false}});assert.ok(missing.includes('HP not listed'));assert.ok(missing.includes('CC not listed'));assert.ok(missing.includes('Image not added'));assert.ok(!missing.includes('class="showcase-demand"'));
});

test('the partner strip, video carousel and tractor section stay together below the hero without duplicates',()=>{
 const {resolveHomepageSections}=loadShowcase('config/homepage-sections.ts');
 const defaults=resolveHomepageSections([]);assert.deepEqual(defaults.slice(0,4).map(item=>item.key),['hero','partners','videos','tractors']);assert.ok(!defaults.some(item=>item.key==='youtube'));
 assert.ok(!resolveHomepageSections([{id:'y',key:'youtube',visible:true,title:'Should not return'}]).some(item=>item.key==='youtube'));
 const overridden=resolveHomepageSections([{id:'t',key:'tractors',order:99,title:'Our tractors'},{id:'i',key:'introduction',order:3},{id:'p',key:'partners',visible:false}]);
 assert.deepEqual(overridden.slice(0,3).map(item=>item.key),['hero','videos','tractors']);assert.equal(overridden.filter(item=>item.key==='tractors').length,1);assert.equal(overridden.find(item=>item.key==='tractors').title,'Our tractors');assert.ok(!overridden.some(item=>item.key==='partners'));
 const noTractors=resolveHomepageSections([{id:'t',key:'tractors',visible:false}]);assert.deepEqual(noTractors.slice(0,3).map(item=>item.key),['hero','partners','videos']);assert.ok(!noTractors.some(item=>item.key==='tractors'));
});

test('partner frame loop only moves left through repeated seams and cleans up its clock',()=>{
 const {createPartnerScroller}=loadShowcase('lib/partner-scroll.ts');
 let nextId=0;const pending=new Map();const positions=[];
 const controller=createPartnerScroller({render:offset=>positions.push(offset),requestFrame:callback=>{pending.set(++nextId,callback);return nextId;},cancelFrame:id=>pending.delete(id)});
 const frame=time=>{const callbacks=[...pending.values()];pending.clear();callbacks.forEach(callback=>callback(time));};
 controller.setLoopWidth(32);assert.equal(pending.size,0);
 controller.play();frame(0);
 let previous=positions.at(-1);let wraps=0;
 for(let time=50;time<=3500;time+=50){
  frame(time);const current=positions.at(-1);
  assert.ok(current<=0&&current>=-32);
  assert.ok(Math.abs(((previous-current+32)%32)-1.6)<0.00001);
  if(current>previous)wraps++;
  previous=current;
 }
 assert.equal(wraps,3);
 controller.pause();const stopped=positions.length;frame(4000);assert.equal(positions.length,stopped);
 controller.play();frame(5000);frame(5050);assert.equal(pending.size,1);
 controller.setLoopWidth(64);assert.ok(positions.at(-1)<=0);
 controller.setLoopWidth(0);assert.equal(pending.size,0);assert.equal(positions.at(-1),0);
 controller.setLoopWidth(32);assert.equal(pending.size,1);
 controller.destroy();assert.equal(pending.size,0);controller.play();assert.equal(pending.size,0);
});

test('partner carousel starts moving on mount when reduced motion is disabled',()=>{
 const effects=[];const pending=new Map();let frameId=0;
 const element={scrollWidth:984,style:{}};
 const refs=[{current:{clientWidth:472}},{current:element},{current:{getBoundingClientRect:()=>({width:492})}}];
 const loaded={exports:{}};
 new Function('require','module','exports',source)(name=>{
  if(name==='react')return {...React,useRef:()=>refs.shift(),useEffect:effect=>effects.push(effect),useState:initial=>[initial,()=>{}]};
  if(name.endsWith('.css'))return {};
  if(name==='@/components/LocalizedElement')return {LocalizedElement:({as,children,...props})=>React.createElement(as,props,children)};
  if(name==='./FavouriteButton')return {FavouriteButton:()=>null};
  if(name==='@/lib/partner-scroll')return loadShowcase('lib/partner-scroll.ts');
  return require(name);
 },loaded,loaded.exports);
 const partners=[{id:'1',title:'First',image:'/first.png'},{id:'2',title:'Last',image:'/last.png'}];
 const child=loaded.exports.HomePartners({title:'Partners',partners}).props.children.find(child=>child.type?.name==='PartnerLogoCarousel');
 child.type(child.props);
 const previousWindow=Object.getOwnPropertyDescriptor(globalThis,'window');
 const previousObserver=Object.getOwnPropertyDescriptor(globalThis,'ResizeObserver');
 Object.defineProperty(globalThis,'window',{configurable:true,value:{
  requestAnimationFrame:callback=>{pending.set(++frameId,callback);return frameId;},
  cancelAnimationFrame:id=>pending.delete(id),
  addEventListener:()=>{},removeEventListener:()=>{},
  matchMedia:()=>({matches:false,addEventListener:()=>{},removeEventListener:()=>{}}),
 }});
 Object.defineProperty(globalThis,'ResizeObserver',{configurable:true,value:undefined});
 let cleanup;
 try{
  assert.equal(effects.length,1);
  cleanup=effects[0]();
  assert.equal(pending.size,1);
  for(const time of [0,50,100]){const callbacks=[...pending.values()];pending.clear();callbacks.forEach(callback=>callback(time));}
  assert.equal(element.style.transform,'translate3d(-3.200px,0,0)');
  cleanup();cleanup=undefined;assert.equal(pending.size,0);
 }finally{
  cleanup?.();
  if(previousWindow)Object.defineProperty(globalThis,'window',previousWindow);else delete globalThis.window;
  if(previousObserver)Object.defineProperty(globalThis,'ResizeObserver',previousObserver);else delete globalThis.ResizeObserver;
 }
});
