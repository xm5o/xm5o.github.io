const DEFAULT_URL='https://xm5o-github-io.eminem13981398.workers.dev';
const URL_KEY='immortalProfilePublisherUrl';
const LOCAL_KEY='immortalProfilePublisherKey';
const SESSION_KEY='immortalProfilePublisherSessionKey';
const REMEMBER_KEY='immortalProfilePublisherRemember';
const AUTO_LOCK_MS=15*60*1000;
let publisherKey='';
let ready=false;
let lockTimer=null;
const listeners=new Set();
const $=id=>document.getElementById(id);
function getLocal(key){try{return localStorage.getItem(key)||''}catch{return''}}
function setLocal(key,value){try{value?localStorage.setItem(key,value):localStorage.removeItem(key)}catch{}}
function getSession(key){try{return sessionStorage.getItem(key)||''}catch{return''}}
function setSession(key,value){try{value?sessionStorage.setItem(key,value):sessionStorage.removeItem(key)}catch{}}
function normalizeUrl(value){try{const url=new URL(String(value||'').trim());return url.protocol==='https:'?url.href.replace(/\/+$/,''):''}catch{return''}}
function notify(){for(const listener of listeners)listener(ready)}
function setUi(message=''){const setup=$('publisherSetup'),connected=$('publisherConnected'),connection=$('connectionState'),host=$('publisherHost');setup.hidden=ready;connected.hidden=!ready;connection.dataset.state=ready?'online':'offline';connection.querySelector('strong').textContent=ready?'Direct publisher ready':'Publisher locked';host.textContent=ready?new URL(getPublisherUrl()).host:'';['saveSettingsButton','saveSeoButton','createSnapshotButton'].forEach(id=>{const el=$(id);if(el)el.disabled=!ready});if(message){const status=$('setupStatus');status.textContent=message;status.className=`setup-status${ready?' success':''}`}}
function resetTimer(){if(!ready)return;clearTimeout(lockTimer);lockTimer=setTimeout(()=>lockPublisher('Auto-locked after 15 minutes of inactivity.'),AUTO_LOCK_MS)}
export function getPublisherUrl(){return normalizeUrl(getLocal(URL_KEY)||DEFAULT_URL)}
export function isPublisherReady(){return ready}
export function onAuthChange(listener){listeners.add(listener);return()=>listeners.delete(listener)}
export async function publisherRequest(path,options={}){if(!ready||!publisherKey)throw new Error('Publisher is locked.');resetTimer();const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),options.timeout||20000);try{const response=await fetch(`${getPublisherUrl()}${path}`,{method:options.method||'GET',headers:{Authorization:`Bearer ${publisherKey}`,...(options.headers||{})},body:options.body,cache:'no-store',signal:controller.signal});const payload=await response.json().catch(()=>({}));if(!response.ok)throw new Error(payload.error||`${response.status} ${response.statusText}`);return payload}finally{clearTimeout(timeout)}}
export function lockPublisher(message='Publisher locked for this session.'){ready=false;publisherKey='';setSession(SESSION_KEY,'');clearTimeout(lockTimer);setUi(message);notify()}
async function unlock(key,remember){const value=String(key||'').trim();if(value.length<16)throw new Error('Enter your private publisher key.');publisherKey=value;ready=true;await publisherRequest('/auth-check');if(remember){setLocal(LOCAL_KEY,value);setLocal(REMEMBER_KEY,'1');setSession(SESSION_KEY,'')}else{setSession(SESSION_KEY,value);setLocal(LOCAL_KEY,'');setLocal(REMEMBER_KEY,'')}setUi('Publisher unlocked.');resetTimer();notify()}
export async function initAuth(){const urlInput=$('publisherUrl'),keyInput=$('publisherKey'),remember=$('rememberPublisher'),button=$('savePublisherButton'),lock=$('forgetPublisherButton'),status=$('setupStatus');urlInput.value=getLocal(URL_KEY)||DEFAULT_URL;remember.checked=getLocal(REMEMBER_KEY)==='1';publisherKey=getSession(SESSION_KEY)||(remember.checked?getLocal(LOCAL_KEY):'');button.addEventListener('click',async()=>{const url=normalizeUrl(urlInput.value||DEFAULT_URL);if(!url){status.textContent='The Cloudflare Worker URL is invalid.';status.className='setup-status error';return}setLocal(URL_KEY,url);const value=String(keyInput.value||(remember.checked?getLocal(LOCAL_KEY):'')).trim();button.disabled=true;button.innerHTML='<i class="bx bx-loader-alt bx-spin"></i> Unlocking…';try{ready=true;await unlock(value,remember.checked);keyInput.value=''}catch(error){ready=false;publisherKey='';setUi();status.textContent=error.message||'Could not unlock the publisher.';status.className='setup-status error'}finally{button.disabled=false;button.innerHTML='<i class="bx bx-lock-open-alt"></i> Unlock publisher'}});lock.addEventListener('click',()=>lockPublisher());['pointerdown','keydown','touchstart'].forEach(event=>window.addEventListener(event,resetTimer,{passive:true}));if(publisherKey){ready=true;try{await publisherRequest('/auth-check');setUi();resetTimer();notify();return true}catch{ready=false;publisherKey=''}}setUi();notify();return false}
