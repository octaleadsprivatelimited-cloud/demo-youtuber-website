import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
function load(file){const filename=path.resolve(file);const mod={exports:{}};const src=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;new Function('require','module','exports',src)(p=>p.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(filename),p),'utf8')):require(p),mod,mod.exports);return mod.exports;}
const {readLanguage,languageCookie,LANGUAGE_MAX_AGE}=load('lib/i18n/preference.ts');
const {translate}=load('lib/i18n/translate.ts');
const {contentDictionary}=load('lib/i18n/content.ts');
test('first visit and invalid preferences require language selection',()=>{assert.equal(readLanguage(''),null);assert.equal(readLanguage('rj-language=fr'),null);assert.equal(readLanguage('other-rj-language=te'),null);});
test('valid language persists site-wide for exactly thirty days',()=>{assert.equal(LANGUAGE_MAX_AGE,2592000);assert.match(languageCookie('te'),/Max-Age=2592000; Path=\/; SameSite=Lax/);assert.equal(readLanguage('session=x; rj-language=te'),'te');assert.equal(readLanguage('rj-language=en; session=x'),'en');assert.equal(readLanguage('session=x'),null);});
test('English is reversible and brand names and values are preserved',()=>{assert.equal(translate('Compare','en'),'Compare');assert.equal(translate('Compare','te'),'పోల్చండి');assert.equal(translate('Mahindra 575 DI','te'),'Mahindra 575 DI');assert.equal(translate('50 HP','te'),'50 HP');});
test('translation retains surrounding spaces and action arrows',()=>{assert.equal(translate(' Compare ','te'),' పోల్చండి ');assert.equal(translate('Browse tractors →','te'),'ట్రాక్టర్లను చూడండి →');});
test('published model counters translate without changing the number',()=>{assert.equal(translate('12 published models','te'),'12 ప్రచురించిన మోడళ్లు');});
test('editor copy supports aliases, paragraph rendering and blank fallback',()=>{const dict=contentDictionary([{title:'English',titleTe:'తెలుగు',body:'First\nSecond',contentTe:'మొదటి\nరెండవ',description:'Fallback',descriptionTe:''}]);assert.equal(dict.English,'తెలుగు');assert.equal(dict.First,'మొదటి');assert.equal(dict.Second,'రెండవ');assert.equal(dict.Fallback,undefined);});
test('review lists retain their translated entries',()=>{const result=contentDictionary([{pros:['Strong','Efficient'],prosTe:'బలమైనది\nసమర్థమైనది'}]);assert.equal(result.Strong,'బలమైనది');assert.equal(result.Efficient,'సమర్థమైనది');});
test('Telugu search finds editorial content without changing URLs',()=>{const {buildSearchItems,findSearchResults}=load('utils/site-search.ts');const items=buildSearchItems('articles',[{id:'1',status:'published',title:'Buying guide',titleTe:'కొనుగోలు మార్గదర్శకం',slug:'buying-guide'}]);assert.equal(findSearchResults(items,'కొనుగోలు')[0].href,'/articles/buying-guide');});
