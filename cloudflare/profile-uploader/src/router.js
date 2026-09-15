import baseWorker from './index.js';
import{handleExtended}from'./extended.js';
import{handleCms,processSchedule}from'./cms.js';
import{handleOAuthPublic,verifySessionToken}from'./oauth.js';

const EXTENDED=new Set(['/activity','/seo','/snapshots','/snapshots/restore']);
const CMS=new Set(['/settings','/cms/publish','/cms/undo','/health/full','/library','/presets','/schedule','/backup/export','/backup/import','/logs']);
function norm(v){return String(v||'').trim().replace(/\/+$/,'')}
function cors(origin,allowed){const h={'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Max-Age':'86400','Cache-Control':'no-store'};if(origin&&origin===allowed){h['Access-Control-Allow-Origin']=origin;h.Vary='Origin'}return h}
function json(data,status,origin,allowed){return new Response(JSON.stringify(data),{status,headers:{...cors(origin,allowed),'Content-Type':'application/json; charset=utf-8'}})}
function bearer(request){return String(request.headers.get('Authorization')||'').match(/^Bearer\s+(.+)$/i)?.[1]?.trim()||''}
async function safeEqual(a,b){const e=new TextEncoder(),[l,r]=await Promise.all([crypto.subtle.digest('SHA-256',e.encode(String(a||''))),crypto.subtle.digest('SHA-256',e.encode(String(b||'')))]),x=new Uint8Array(l),y=new Uint8Array(r);let d=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)d|=(x[i]||0)^(y[i]||0);return d===0}
async function authorized(request,env){const token=bearer(request);if(!token)return false;if(await safeEqual(token,env.ADMIN_KEY))return true;return Boolean(await verifySessionToken(env,token))}
function withAdminAuth(request,env){const headers=new Headers(request.headers);headers.set('Authorization',`Bearer ${env.ADMIN_KEY}`);return new Request(request,{headers})}
function addCors(response,origin,allowed){const headers=new Headers(response.headers);for(const[k,v]of Object.entries(cors(origin,allowed)))headers.set(k,v);return new Response(response.body,{status:response.status,statusText:response.statusText,headers})}

export default{
async fetch(request,env){const url=new URL(request.url),origin=norm(request.headers.get('Origin')),allowed=norm(env.ALLOWED_ORIGIN);
if(url.pathname.startsWith('/auth/')){const authResponse=await handleOAuthPublic(request,env);if(authResponse)return url.pathname==='/auth/config'?addCors(authResponse,origin,allowed):authResponse}
if(request.method==='OPTIONS'&&(CMS.has(url.pathname)||EXTENDED.has(url.pathname))){if(!origin||origin!==allowed)return json({ok:false,error:'Origin not allowed.'},403,origin,allowed);return new Response(null,{status:204,headers:cors(origin,allowed)})}
if(origin&&origin!==allowed)return json({ok:false,error:'Origin not allowed.'},403,origin,allowed);
const sessionAuthorized=await authorized(request,env);
if(CMS.has(url.pathname)||EXTENDED.has(url.pathname)){if(!sessionAuthorized)return json({ok:false,error:'Invalid publisher session.'},401,origin,allowed);const authed=withAdminAuth(request,env);const result=CMS.has(url.pathname)?await handleCms(authed,env):await handleExtended(authed,env,origin,allowed);return result||json({ok:false,error:'Not found.'},404,origin,allowed)}
if(sessionAuthorized&&!(await safeEqual(bearer(request),env.ADMIN_KEY)))return baseWorker.fetch(withAdminAuth(request,env),env);
return baseWorker.fetch(request,env)},
async scheduled(controller,env,ctx){ctx.waitUntil(processSchedule(env))}
};
