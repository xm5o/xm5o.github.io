const $=value=>String(value).startsWith('#')?document.querySelector(value):document.getElementById(value);
const go=workspace=>window.dispatchEvent(new CustomEvent('immortal:navigate',{detail:{workspace}}));
const goAnd=(workspace,fn)=>{go(workspace);requestAnimationFrame(()=>requestAnimationFrame(fn))};
const commands=[
  {label:'Go to Overview',icon:'bx-grid-alt',run:()=>go('overview')},
  {label:'Go to Profile',icon:'bx-user-circle',run:()=>go('profile')},
  {label:'Go to Appearance',icon:'bx-palette',run:()=>go('appearance')},
  {label:'Go to Content',icon:'bx-edit-alt',run:()=>go('content')},
  {label:'Go to SEO & Sharing',icon:'bx-search-alt',run:()=>go('seo')},
  {label:'Go to Publish',icon:'bx-cloud-upload',run:()=>go('publish')},
  {label:'Go to Image Library',icon:'bx-images',run:()=>go('library')},
  {label:'Go to Backups',icon:'bx-archive',run:()=>go('backups')},
  {label:'Go to Automation',icon:'bx-time-five',run:()=>go('automation')},
  {label:'Go to System',icon:'bx-cog',run:()=>go('system')},
  {label:'Publish all staged changes',icon:'bx-cloud-upload',run:()=>$('#publishAllButton')?.click()},
  {label:'Undo last publish',icon:'bx-undo',run:()=>goAnd('publish',()=>$('#undoLastButton')?.click())},
  {label:'Save site content',icon:'bx-save',run:()=>goAnd('content',()=>$('#saveSettingsButton')?.click())},
  {label:'Save SEO metadata',icon:'bx-search',run:()=>goAnd('seo',()=>$('#saveSeoButton')?.click())},
  {label:'Create snapshot',icon:'bx-camera',run:()=>goAnd('backups',()=>$('#createSnapshotButton')?.click())},
  {label:'Refresh real preview',icon:'bx-refresh',run:()=>goAnd('appearance',()=>$('#refreshRealPreview')?.click())},
  {label:'Refresh health dashboard',icon:'bx-pulse',run:()=>goAnd('overview',()=>$('#refreshHealth')?.click())},
  {label:'Toggle maintenance mode',icon:'bx-wrench',run:()=>goAnd('content',()=>{const e=$('#maintenanceEnabled');if(e){e.checked=!e.checked;e.dispatchEvent(new Event('change',{bubbles:true}))}})},
  {label:'Preview desktop',icon:'bx-desktop',run:()=>goAnd('appearance',()=>document.querySelector('[data-preview-size-button="desktop"]')?.click())},
  {label:'Preview tablet',icon:'bx-tab',run:()=>goAnd('appearance',()=>document.querySelector('[data-preview-size-button="tablet"]')?.click())},
  {label:'Preview phone',icon:'bx-mobile-alt',run:()=>goAnd('appearance',()=>document.querySelector('[data-preview-size-button="phone"]')?.click())},
  {label:'Open main website',icon:'bx-link-external',run:()=>window.open('../../','_blank','noopener')}
];
function render(query=''){const box=$('commandList'),q=query.trim().toLowerCase(),items=commands.filter(c=>!q||c.label.toLowerCase().includes(q));box.replaceChildren();for(const c of items){const b=document.createElement('button');b.type='button';b.innerHTML=`<i class="bx ${c.icon}"></i><span>${c.label}</span>`;b.addEventListener('click',()=>{close();c.run()});box.append(b)}if(!items.length)box.innerHTML='<div class="command-empty">No matching commands.</div>'}
function open(){const modal=$('commandPalette');modal.hidden=false;$('commandSearch').value='';render();requestAnimationFrame(()=>$('commandSearch').focus())}function close(){$('commandPalette').hidden=true}
export function initCommandPalette(){$('commandSearch').addEventListener('input',e=>render(e.target.value));document.querySelectorAll('[data-close-command]').forEach(el=>el.addEventListener('click',close));$('openCommandPalette').addEventListener('click',open);window.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('commandPalette').hidden?open():close()}else if(e.key==='Escape'&&!$('commandPalette').hidden)close()})}
