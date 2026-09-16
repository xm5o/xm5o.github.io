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
import{initReleaseUi}from'./release.js';
import{initAdminPreferences}from'./preferences.js';
import{initAdminInsights}from'./insights.js';

function loadExtraStyle(href,key){if(document.querySelector(`link[data-${key}]`))return;const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset[key]='true';document.head.append(link)}
async function init(){
  loadExtraStyle('polish.css?v=20260916-2','adminPolish');
  loadExtraStyle('advanced.css?v=20260916-1','adminAdvanced');
  const restoredDraft=await initDraftState();
  initUx();
  initAdminPreferences();
  initReleaseUi();
  initAdminInsights();
  initWorkspaceLoader();
  initAdminLayout();
  initSiteControls();
  initProfileEditor();
  initAssetEditor();
  initCmsUi();
  initCommandPalette();
  initPwa();
  if(restoredDraft?.hasChanges)showToast(`Recovered ${restoredDraft.count} staged change${restoredDraft.count===1?'':'s'} from your previous session.`,{title:'Draft recovered',type:'success',duration:6500});
  await initAuth();
}

init().catch(error=>{
  console.error('[Immortal Admin]',error);
  showToast(friendlyError(error,'Could not start the site manager.'),{title:'Admin startup failed',type:'error',persistent:true});
  const status=document.getElementById('setupStatus')||document.getElementById('settingsStatus');
  if(status){status.textContent=friendlyError(error,'Could not start the site manager.');status.className='setup-status error';}
});
