const $=value=>String(value).startsWith('#')?document.querySelector(value):document.getElementById(value);
const commands=[
  {label:'Publish all staged changes',icon:'bx-cloud-upload',run:()=>$('#publishAllButton')?.click()},
  {label:'Undo last publish',icon:'bx-undo',run:()=>$('#undoLastButton')?.click()},
  {label:'Save site settings',icon:'bx-save',run:()=>$('#saveSettingsButton')?.click()},
  {label:'Save SEO metadata',icon:'bx-search',run:()=>$('#saveSeoButton')?.click()},
  {label:'Create snapshot',icon:'bx-camera',run:()=>$('#createSnapshotButton')?.click()},
  {label:'Refresh real preview',icon:'bx-refresh',run:()=>$('#refreshRealPreview')?.click()},
  {label:'Refresh health dashboard',icon:'bx-pulse',run:()=>$('#refreshHealth')?.click()},
  {label:'Open image library',icon:'bx-images',run:()=>$('#libraryCard')?.scrollIntoView({behavior:'smooth',block:'start'})},
  {label:'Open theme presets',icon:'bx-palette',run:()=>$('#presetsCard')?.scrollIntoView({behavior:'smooth',block:'start'})},
  {label:'Open scheduled changes',icon:'bx-time-five',run:()=>$('#scheduleCard')?.scrollIntoView({behavior:'smooth',block:'start'})},
  {label:'Toggle maintenance mode',icon:'bx-wrench',run:()=>{const e=$('#maintenanceEnabled');if(e){e.checked=!e.checked;e.dispatchEvent(new Event('change',{bubbles:true}))}}},
  {label:'Preview desktop',icon:'bx-desktop',run:()=>document.querySelector('[data-preview-size-button="desktop"]')?.click()},
  {label:'Preview tablet',icon:'bx-tab',run:()=>document.querySelector('[data-preview-size-button="tablet"]')?.click()},
  {label:'Preview phone',icon:'bx-mobile-alt',run:()=>document.querySelector('[data-preview-size-button="phone"]')?.click()},
  {label:'Open main website',icon:'bx-link-external',run:()=>window.open('../../','_blank','noopener')}
];
function render(query=''){const box=$('commandList'),q=query.trim().toLowerCase(),items=commands.filter(c=>!q||c.label.toLowerCase().includes(q));box.replaceChildren();for(const c of items){const b=document.createElement('button');b.type='button';b.innerHTML=`<i class="bx ${c.icon}"></i><span>${c.label}</span>`;b.addEventListener('click',()=>{close();c.run()});box.append(b)}if(!items.length)box.innerHTML='<div class="command-empty">No matching commands.</div>'}
function open(){const modal=$('commandPalette');modal.hidden=false;$('commandSearch').value='';render();requestAnimationFrame(()=>$('commandSearch').focus())}function close(){$('commandPalette').hidden=true}
export function initCommandPalette(){$('commandSearch').addEventListener('input',e=>render(e.target.value));document.querySelectorAll('[data-close-command]').forEach(el=>el.addEventListener('click',close));$('openCommandPalette').addEventListener('click',open);window.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('commandPalette').hidden?open():close()}else if(e.key==='Escape'&&!$('commandPalette').hidden)close()})}
