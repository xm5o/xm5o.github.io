import{access,readdir,readFile}from'node:fs/promises';
import path from'node:path';
import process from'node:process';
const root=process.cwd(),admin=path.join(root,'admin/profile');
function ok(condition,message){if(!condition)throw new Error(message)}
async function exists(file){try{await access(file);return true}catch{return false}}
const required=['index.html','app.js','auth.js','draft.js','layout.js','layout.css','polish.css','advanced.css','ux.js','workspace-loader.js','cms-ui.js','site-controls.js','profile-editor.js','asset-editor.js','pwa.js','release.js','release.json','preferences.js','insights.js','staging-ui.js','stage.html','stage.js','sw.js','manifest.webmanifest','offline.html','admin-icon.svg'];
for(const file of required)ok(await exists(path.join(admin,file)),`Missing admin file: ${file}`);
const html=await readFile(path.join(admin,'index.html'),'utf8');
for(const id of['publisherSetup','publisherConnected','publishAllButton','discardDraftButton','draftCount','globalPublishStatus','realPreviewFrame','historyList','libraryList','snapshotList','presetList','scheduleList','cmsLogs','assetCropModal','commandPalette'])ok(html.includes(`id="${id}"`),`Missing critical DOM id: ${id}`);
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);ok(!duplicates.length,`Duplicate DOM ids: ${[...new Set(duplicates)].join(', ')}`);
const manifest=JSON.parse(await readFile(path.join(admin,'manifest.webmanifest'),'utf8'));ok(manifest.icons?.some(icon=>icon.src==='/admin/profile/admin-icon.svg'),'Manifest must use the dedicated admin icon.');ok(manifest.shortcuts?.some(item=>item.url==='/admin/profile/stage.html'),'Manifest must expose the staging preview shortcut.');
const release=JSON.parse(await readFile(path.join(admin,'release.json'),'utf8'));ok(/^\d+\.\d+\.\d+$/.test(release.version||''),'Admin release metadata must contain a semantic version.');
const worker=await readFile(path.join(admin,'sw.js'),'utf8');for(const file of['polish.css','advanced.css','ux.js','workspace-loader.js','release.js','preferences.js','insights.js','staging-ui.js','stage.html','stage.js','offline.html','admin-icon.svg'])ok(worker.includes(file),`Service worker shell is missing ${file}`);
const draft=await readFile(path.join(admin,'draft.js'),'utf8');ok(draft.includes('indexedDB'),'Draft state must be recoverable from IndexedDB.');ok(draft.includes("DRAFT_KEY='draft-v1'"),'Draft persistence key changed unexpectedly.');
const jsFiles=(await readdir(admin)).filter(name=>name.endsWith('.js'));for(const file of jsFiles){const source=await readFile(path.join(admin,file),'utf8');for(const match of source.matchAll(/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"](\.\/[^'"]+)['"]/g)){const target=path.resolve(admin,match[1]);ok(await exists(target),`${file} imports missing local module ${match[1]}`)}}
const router=await readFile(path.join(root,'cloudflare/profile-uploader/src/router.js'),'utf8');ok(router.includes('addHeaders(result,origin,allowed)'),'Worker router must wrap CMS route responses with CORS/security headers.');for(const header of['X-Content-Type-Options','Strict-Transport-Security','Permissions-Policy','Content-Security-Policy'])ok(router.includes(header),`Worker security header missing: ${header}`);ok(router.includes('AUTH_FAILURES'),'Worker must throttle repeated failed admin authentication.');
const cms=await readFile(path.join(root,'cloudflare/profile-uploader/src/cms.js'),'utf8');ok(cms.includes('AUTO_BACKUP_LIMIT=20'),'Automatic backup retention rule is missing.');ok(cms.includes('LOG_LIMIT=60'),'Log retention rule is missing.');
const oauth=await readFile(path.join(root,'cloudflare/profile-uploader/src/oauth.js'),'utf8');ok(oauth.includes('SESSION_MS=4*60*60*1000'),'OAuth admin session duration must remain four hours.');
console.log(`Immortal Admin smoke checks passed (${jsFiles.length} browser modules checked).`);
