import{isPublisherReady,onAuthChange}from'./auth.js';
import{getStagedFile}from'./draft.js';
import{applyRealPreview,loadActivity,loadSeo,loadSettings,loadSnapshots,ensureRealPreviewLoaded}from'./site-controls.js';
import{loadHistory}from'./profile-editor.js';
import{refreshHealth,refreshLibrary,refreshLogs,refreshPresets,refreshSchedule}from'./cms-ui.js';
const loaded=new Set();let current='overview',stagedProfileUrl='';
const syncStagedProfile=()=>{const blob=getStagedFile('assets/pfp.jpg');if(stagedProfileUrl){URL.revokeObjectURL(stagedProfileUrl);stagedProfileUrl=''}if(!(blob instanceof Blob))return;stagedProfileUrl=URL.createObjectURL(blob);const after=document.getElementById('afterImage'),status=document.getElementById('previewStatus');if(after)after.src=stagedProfileUrl;if(status)status.textContent='Recovered staged profile picture';applyRealPreview({image:stagedProfileUrl})};
const loaders={
  overview:async()=>Promise.allSettled([refreshHealth(),loadActivity()]),
  profile:async()=>{await loadHistory();syncStagedProfile()},
  appearance:async()=>{await loadSettings();ensureRealPreviewLoaded()},
  content:async()=>loadSettings(),
  seo:async()=>loadSeo(),
  publish:async()=>{},
  library:async()=>refreshLibrary(),
  backups:async()=>loadSnapshots(),
  automation:async()=>Promise.allSettled([refreshPresets(),refreshSchedule()]),
  system:async()=>refreshLogs()
};
export async function loadWorkspace(name,{force=false}={}){current=name||'overview';if(!isPublisherReady())return;if(!force&&loaded.has(current)){if(current==='appearance')ensureRealPreviewLoaded();if(current==='profile')syncStagedProfile();return}await loaders[current]?.();loaded.add(current)}
export function invalidateWorkspaces(...names){if(!names.length)loaded.clear();else names.forEach(name=>loaded.delete(name))}
export function initWorkspaceLoader(){window.addEventListener('immortal:workspace-change',event=>loadWorkspace(event.detail?.workspace||'overview'));window.addEventListener('immortal:reload-managed-state',()=>{invalidateWorkspaces();loadWorkspace(current,{force:true})});window.addEventListener('immortal:cms-published',()=>{invalidateWorkspaces();loadWorkspace(current,{force:true})});window.addEventListener('immortal:cms-undo',()=>{invalidateWorkspaces();loadWorkspace(current,{force:true})});window.addEventListener('immortal:draft-change',()=>{if(current==='profile')syncStagedProfile()});onAuthChange(ready=>{if(ready){invalidateWorkspaces();loadWorkspace(current,{force:true})}else loaded.clear()});window.addEventListener('beforeunload',()=>{if(stagedProfileUrl)URL.revokeObjectURL(stagedProfileUrl)})}
