import{isPublisherReady,onAuthChange}from'./auth.js';
import{loadActivity,loadSeo,loadSettings,loadSnapshots,ensureRealPreviewLoaded}from'./site-controls.js';
import{loadHistory}from'./profile-editor.js';
import{refreshHealth,refreshLibrary,refreshLogs,refreshPresets,refreshSchedule}from'./cms-ui.js';
const loaded=new Set();let current='overview';
const loaders={
  overview:async()=>Promise.allSettled([refreshHealth(),loadActivity()]),
  profile:async()=>loadHistory(),
  appearance:async()=>{await loadSettings();ensureRealPreviewLoaded()},
  content:async()=>loadSettings(),
  seo:async()=>loadSeo(),
  publish:async()=>{},
  library:async()=>refreshLibrary(),
  backups:async()=>loadSnapshots(),
  automation:async()=>Promise.allSettled([refreshPresets(),refreshSchedule()]),
  system:async()=>refreshLogs()
};
export async function loadWorkspace(name,{force=false}={}){current=name||'overview';if(!isPublisherReady())return;if(!force&&loaded.has(current)){if(current==='appearance')ensureRealPreviewLoaded();return}await loaders[current]?.();loaded.add(current)}
export function invalidateWorkspaces(...names){if(!names.length)loaded.clear();else names.forEach(name=>loaded.delete(name))}
export function initWorkspaceLoader(){window.addEventListener('immortal:workspace-change',event=>loadWorkspace(event.detail?.workspace||'overview'));window.addEventListener('immortal:reload-managed-state',()=>{invalidateWorkspaces();loadWorkspace(current,{force:true})});window.addEventListener('immortal:cms-published',()=>{invalidateWorkspaces();loadWorkspace(current,{force:true})});window.addEventListener('immortal:cms-undo',()=>{invalidateWorkspaces();loadWorkspace(current,{force:true})});onAuthChange(ready=>{if(ready){invalidateWorkspaces();loadWorkspace(current,{force:true})}else loaded.clear()})}
