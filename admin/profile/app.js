import{initAuth}from'./auth.js';
import{initDraftState}from'./draft.js';
import{initAdminLayout}from'./layout.js';
import{initSiteControls}from'./site-controls.js';
import{initProfileEditor}from'./profile-editor.js';
import{initAssetEditor}from'./asset-editor.js';
import{initCmsUi}from'./cms-ui.js';
import{initCommandPalette}from'./command-palette.js';
import{initPwa}from'./pwa.js';
import{initUx,showToast,friendlyError}from'./ux.js';
import{initWorkspaceLoader}from'./workspace-loader.js';

function loadPolishStyle(){if(document.querySelector('link[data-admin-polish]'))return;const link=document.createElement('link');link.rel='stylesheet';link.href='polish.css?v=20260916-1';link.dataset.adminPolish='true';document.head.append(link)}
async function init(){
  loadPolishStyle();
  initDraftState();
  initUx();
  initWorkspaceLoader();
  initAdminLayout();
  initSiteControls();
  initProfileEditor();
  initAssetEditor();
  initCmsUi();
  initCommandPalette();
  initPwa();
  await initAuth();
}

init().catch(error=>{
  console.error('[Immortal Admin]',error);
  showToast(friendlyError(error,'Could not start the site manager.'),{title:'Admin startup failed',type:'error',persistent:true});
  const status=document.getElementById('setupStatus')||document.getElementById('settingsStatus');
  if(status){status.textContent=friendlyError(error,'Could not start the site manager.');status.className='setup-status error';}
});
