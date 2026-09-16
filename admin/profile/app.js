import{initAuth,onAuthChange}from'./auth.js';
import{initDraftState}from'./draft.js';
import{initAdminLayout}from'./layout.js';
import{initSiteControls,loadAllSiteData}from'./site-controls.js';
import{initProfileEditor,loadHistory}from'./profile-editor.js';
import{initAssetEditor}from'./asset-editor.js';
import{initCmsUi,loadCmsData}from'./cms-ui.js';
import{initCommandPalette}from'./command-palette.js';
import{initPwa}from'./pwa.js';

async function init(){
  initAdminLayout();
  initDraftState();
  initSiteControls();
  initProfileEditor();
  initAssetEditor();
  initCmsUi();
  initCommandPalette();
  initPwa();
  onAuthChange(ready=>{if(ready){loadAllSiteData();loadHistory();loadCmsData();}});
  await initAuth();
}

init().catch(error=>{
  console.error('[Immortal Admin]',error);
  const status=document.getElementById('setupStatus')||document.getElementById('settingsStatus');
  if(status){status.textContent=error?.message||'Could not start the site manager.';status.className='setup-status error';}
});
