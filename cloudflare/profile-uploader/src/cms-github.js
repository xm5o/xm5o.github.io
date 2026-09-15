const API_VERSION='2026-03-10';

export function ghHeaders(env){return{Accept:'application/vnd.github+json',Authorization:`Bearer ${env.GITHUB_TOKEN}`,'X-GitHub-Api-Version':API_VERSION,'User-Agent':'Immortal-CMS'}}
export function encPath(path){return String(path).split('/').map(encodeURIComponent).join('/')}
export function contentUrl(env,path,ref=''){return`https://api.github.com/repos/${env.GITHUB_REPO}/contents/${encPath(path)}${ref?`?ref=${encodeURIComponent(ref)}`:''}`}
export async function gh(env,url,opt={}){const response=await fetch(url,{...opt,headers:{...ghHeaders(env),...(opt.headers||{})}});const data=await response.json().catch(()=>({}));return{response,data}}
export function bytesToBase64(bytes){let out='';for(let i=0;i<bytes.length;i+=32768)out+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(out)}
export function base64ToBytes(value){const raw=atob(String(value||'').replace(/\s+/g,''));const out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out}
export function textToBase64(value){return bytesToBase64(new TextEncoder().encode(String(value)))}
export function base64ToText(value){return new TextDecoder().decode(base64ToBytes(value))}

export async function getCurrentHead(env){const refUrl=`https://api.github.com/repos/${env.GITHUB_REPO}/git/ref/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`;const{response,data}=await gh(env,refUrl);if(!response.ok||!data.object?.sha)throw new Error(data.message||`Could not read ${env.GITHUB_BRANCH} (${response.status}).`);return data.object.sha}
export async function getCommit(env,sha){const{response,data}=await gh(env,`https://api.github.com/repos/${env.GITHUB_REPO}/git/commits/${sha}`);if(!response.ok||!data.tree?.sha)throw new Error(data.message||`Could not read commit ${String(sha).slice(0,7)}.`);return data}
export async function getFile(env,path,ref=env.GITHUB_BRANCH,allowMissing=false){const{response,data}=await gh(env,contentUrl(env,path,ref));if(allowMissing&&response.status===404)return null;if(!response.ok||!data.sha)throw new Error(data.message||`Could not read ${path} (${response.status}).`);return data}
export async function readTextFile(env,path,ref=env.GITHUB_BRANCH,fallback=null){const file=await getFile(env,path,ref,true);if(!file)return fallback;if(file.content)return base64ToText(file.content);if(file.download_url){const response=await fetch(file.download_url,{headers:ghHeaders(env),cache:'no-store'});if(!response.ok)throw new Error(`Could not download ${path}.`);return response.text()}return fallback}
export async function readJsonFile(env,path,ref=env.GITHUB_BRANCH,fallback={}){try{const text=await readTextFile(env,path,ref,null);return text?JSON.parse(text):fallback}catch{return fallback}}
export async function readFileBase64(env,path,ref=env.GITHUB_BRANCH){const file=await getFile(env,path,ref,true);if(!file)return null;if(file.content)return String(file.content).replace(/\s+/g,'');if(file.download_url){const response=await fetch(file.download_url,{headers:ghHeaders(env),cache:'no-store'});if(!response.ok)throw new Error(`Could not download ${path}.`);return bytesToBase64(new Uint8Array(await response.arrayBuffer()))}return null}

async function createBlob(env,content,encoding){const{response,data}=await gh(env,`https://api.github.com/repos/${env.GITHUB_REPO}/git/blobs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content,encoding})});if(!response.ok||!data.sha)throw new Error(data.message||'Could not create GitHub blob.');return data.sha}

export async function multiCommit(env,changes,message,{parentSha=null}={}){const parent=parentSha||await getCurrentHead(env);const parentCommit=await getCommit(env,parent);const tree=[];
for(const change of changes){if(!change?.path)continue;if(change.delete){tree.push({path:change.path,mode:'100644',type:'blob',sha:null});continue}const encoding=change.encoding==='base64'?'base64':'utf-8';const sha=await createBlob(env,String(change.content??''),encoding);tree.push({path:change.path,mode:'100644',type:'blob',sha})}
if(!tree.length)throw new Error('There are no changes to publish.');
const treeResult=await gh(env,`https://api.github.com/repos/${env.GITHUB_REPO}/git/trees`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({base_tree:parentCommit.tree.sha,tree})});if(!treeResult.response.ok||!treeResult.data.sha)throw new Error(treeResult.data.message||'Could not create GitHub tree.');
const commitResult=await gh(env,`https://api.github.com/repos/${env.GITHUB_REPO}/git/commits`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,tree:treeResult.data.sha,parents:[parent]})});if(!commitResult.response.ok||!commitResult.data.sha)throw new Error(commitResult.data.message||'Could not create GitHub commit.');
const refResult=await gh(env,`https://api.github.com/repos/${env.GITHUB_REPO}/git/refs/heads/${encodeURIComponent(env.GITHUB_BRANCH)}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({sha:commitResult.data.sha,force:false})});if(!refResult.response.ok)throw new Error(refResult.data.message||'Could not move the branch to the new commit.');
return{sha:commitResult.data.sha,url:commitResult.data.html_url||`https://github.com/${env.GITHUB_REPO}/commit/${commitResult.data.sha}`,parentSha:parent}}

export async function restorePathsFromCommit(env,sourceCommit,paths,extraChanges=[],message='Restore managed site state'){const changes=[];for(const path of paths){const content=await readFileBase64(env,path,sourceCommit);changes.push(content?{path,content,encoding:'base64'}:{path,delete:true})}changes.push(...extraChanges);return multiCommit(env,changes,message)}

export async function listDirectory(env,path){const{response,data}=await gh(env,contentUrl(env,path,env.GITHUB_BRANCH));if(response.status===404)return[];if(!response.ok||!Array.isArray(data))throw new Error(data.message||`Could not list ${path}.`);return data}
