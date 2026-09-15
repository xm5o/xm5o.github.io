import{initAuth,onAuthChange}from'./auth.js';
import{initDraftState}from'./draft.js';
import{initSiteControls,loadAllSiteData}from'./site-controls.js';
import{initProfileEditor,loadHistory}from'./profile-editor.js';
import{initAssetEditor}from'./asset-editor.js';
import{initCmsUi,loadCmsData}from'./cms-ui.js';
import{initCommandPalette}from'./command-palette.js';
import{initPwa}from'./pwa.js';

function loadCmsStyle(){if(document.querySelector('link[data-cms-style]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='cms.css?v=20260915-1';link.dataset.cmsStyle='true';document.head.append(link)}
async function init(){
  loadCmsStyle();
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
  const status=document.getElementById('setupStatus');
  if(status){status.textContent=error?.message||'Could not start the site manager.';status.className='setup-status error';}
});
