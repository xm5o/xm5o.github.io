import{publisherRequest,isPublisherReady}from'./auth.js';
const MODE_KEY='immortalCmsDraftMode';
const listeners=new Set();
const state={enabled:true,settings:null,seo:null,files:new Map(),notes:new Map()};
function readMode(){try{return localStorage.getItem(MODE_KEY)!=='0'}catch{return true}}
function saveMode(){try{localStorage.setItem(MODE_KEY,state.enabled?'1':'0')}catch{}}
function notify(){const detail=getDraftSummary();for(const fn of listeners)fn(detail);window.dispatchEvent(new CustomEvent('immortal:draft-change',{detail}))}
async function blob64(blob){const bytes=new Uint8Array(await blob.arrayBuffer());let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
export function initDraftState(){state.enabled=readMode();notify()}
export function isDraftMode(){return state.enabled}
export function setDraftMode(value){state.enabled=Boolean(value);saveMode();notify()}
export function onDraftChange(fn){listeners.add(fn);return()=>listeners.delete(fn)}
export function stageSettings(value,label='Site settings'){state.settings=structuredClone(value);state.notes.set('settings',label);notify()}
export function stageSeo(value,label='SEO metadata'){state.seo=structuredClone(value);state.notes.set('seo',label);notify()}
export function stageFile(path,blob,label=path){state.files.set(path,blob);state.notes.set(path,label);notify()}
export function clearStagedFile(path){state.files.delete(path);state.notes.delete(path);notify()}
export function getStagedFile(path){return state.files.get(path)||null}
export function clearDraft(){state.settings=null;state.seo=null;state.files.clear();state.notes.clear();notify()}
export function getDraftSummary(){const items=[];if(state.settings)items.push({key:'settings',label:state.notes.get('settings')||'Site settings'});if(state.seo)items.push({key:'seo',label:state.notes.get('seo')||'SEO metadata'});for(const path of state.files.keys())items.push({key:path,label:state.notes.get(path)||path});return{enabled:state.enabled,count:items.length,items,hasChanges:items.length>0}}
export async function publishDraft({saveToLibrary=true}={}){if(!isPublisherReady())throw new Error('Unlock the publisher first.');const summary=getDraftSummary();if(!summary.hasChanges)throw new Error('There are no staged changes.');const files=[];for(const[path,blob]of state.files)files.push({path,base64:await blob64(blob)});const result=await publisherRequest('/cms/publish',{method:'POST',timeout:90000,headers:{'Content-Type':'application/json'},body:JSON.stringify({settings:state.settings,seo:state.seo,files,saveToLibrary,message:'Publish Immortal site manager draft'})});clearDraft();window.dispatchEvent(new CustomEvent('immortal:cms-published',{detail:result}));return result}
export async function undoLastPublish(){if(!isPublisherReady())throw new Error('Unlock the publisher first.');const result=await publisherRequest('/cms/undo',{method:'POST',timeout:90000,headers:{'Content-Type':'application/json'},body:'{}'});clearDraft();window.dispatchEvent(new CustomEvent('immortal:cms-undo',{detail:result}));return result}
