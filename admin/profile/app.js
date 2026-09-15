import {initAuth,onAuthChange} from './auth.js';
import {initSiteControls,loadAllSiteData} from './site-controls.js';
import {initProfileEditor,loadHistory} from './profile-editor.js';
import {initAssetEditor} from './asset-editor.js';
import {initPwa} from './pwa.js';

async function init(){
  initSiteControls();
  initProfileEditor();
  initAssetEditor();
  initPwa();
  onAuthChange(ready=>{if(ready){loadAllSiteData();loadHistory();}});
  await initAuth();
}

init().catch(error=>{
  console.error('[Immortal Admin]',error);
  const status=document.getElementById('setupStatus');
  if(status){status.textContent=error?.message||'Could not start the site manager.';status.className='setup-status error';}
});
