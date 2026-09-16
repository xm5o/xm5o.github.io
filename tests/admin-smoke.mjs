import{access,readdir,readFile}from'node:fs/promises';
import path from'node:path';
import process from'node:process';
const root=process.cwd(),admin=path.join(root,'admin/profile');
function ok(condition,message){if(!condition)throw new Error(message)}
async function exists(file){try{await access(file);return true}catch{return false}}
const required=['index.html','app.js','auth.js','draft.js','layout.js','layout.css','polish.css','ux.js','workspace-loader.js','cms-ui.js','site-controls.js','profile-editor.js','asset-editor.js','pwa.js','sw.js','manifest.webmanifest','offline.html','admin-icon.svg'];
for(const file of required)ok(await exists(path.join(admin,file)),`Missing admin file: ${file}`);
const html=await readFile(path.join(admin,'index.html'),'utf8');
for(const id of['publisherSetup','publisherConnected','publishAllButton','discardDraftButton','draftCount','globalPublishStatus','realPreviewFrame','historyList','libraryList','snapshotList','presetList','scheduleList','cmsLogs','assetCropModal','commandPalette'])ok(html.includes(`id="${id}"`),`Missing critical DOM id: ${id}`);
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);ok(!duplicates.length,`Duplicate DOM ids: ${[...new Set(duplicates)].join(', ')}`);
const manifest=JSON.parse(await readFile(path.join(admin,'manifest.webmanifest'),'utf8'));ok(manifest.icons?.some(icon=>icon.src==='/admin/profile/admin-icon.svg'),'Manifest must use the dedicated admin icon.');
const worker=await readFile(path.join(admin,'sw.js'),'utf8');for(const file of['polish.css','ux.js','workspace-loader.js','offline.html','admin-icon.svg'])ok(worker.includes(file),`Service worker shell is missing ${file}`);
const jsFiles=(await readdir(admin)).filter(name=>name.endsWith('.js'));for(const file of jsFiles){const source=await readFile(path.join(admin,file),'utf8');for(const match of source.matchAll(/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"](\.\/[^'"]+)['"]/g)){const target=path.resolve(admin,match[1]);ok(await exists(target),`${file} imports missing local module ${match[1]}`)}}
const router=await readFile(path.join(root,'cloudflare/profile-uploader/src/router.js'),'utf8');ok(router.includes('addCors(result,origin,allowed)'),'Worker router must CORS-wrap CMS route responses.');
console.log(`Immortal Admin smoke checks passed (${jsFiles.length} browser modules checked).`);
