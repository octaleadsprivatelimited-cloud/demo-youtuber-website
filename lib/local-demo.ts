export type LocalRecord={id:string;[key:string]:unknown};
export function readLocal<T extends{id:string}>(collection:string):T[]{if(typeof window==='undefined')return[];try{return JSON.parse(localStorage.getItem(`rj-demo-${collection}`)??'[]')as T[];}catch{return[];}}
export function writeLocal<T extends{id:string}>(collection:string,items:T[]){if(typeof window!=='undefined'){localStorage.setItem(`rj-demo-${collection}`,JSON.stringify(items));window.dispatchEvent(new CustomEvent('rj-demo-data',{detail:{collection}}));}}
export function published<T extends{id:string;status?:unknown}>(collection:string){return readLocal<T>(collection).filter(item=>['published','approved'].includes(String(item.status).toLowerCase()));}
