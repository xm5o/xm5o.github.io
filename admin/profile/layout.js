const WORKSPACE_KEY='immortalAdminWorkspace';
const $=id=>document.getElementById(id);
const workspaceMeta={
  overview:{title:'Overview',description:'Status, recent activity, and the fastest paths into your site.'},
  profile:{title:'Profile',description:'Edit the profile picture, framing, palette, and previous versions.'},
  appearance:{title:'Appearance',description:'Preview the real homepage and control colors, background, banner, and favicon.'},
  content:{title:'Content',description:'Update your bio, status, commissions, and maintenance screen.'},
  seo:{title:'SEO & Sharing',description:'Control search metadata and how the site looks when it is shared.'},
  publish:{title:'Publish',description:'Review every staged change, choose draft behavior, publish once, or undo.'},
  library:{title:'Library',description:'Reuse previously published profile pictures and visual assets.'},
  backups:{title:'Backups',description:'Create restore points and move the managed site state in or out safely.'},
  automation:{title:'Automation',description:'Save visual presets and schedule them to go live later.'},
  system:{title:'System',description:'Authentication, Worker connectivity, and diagnostics.'}
};
function storedWorkspace(){try{return localStorage.getItem(WORKSPACE_KEY)||'overview'}catch{return'overview'}}
function storeWorkspace(value){try{localStorage.setItem(WORKSPACE_KEY,value)}catch{}}
function closeMenu(){document.body.classList.remove('admin-menu-open');$('adminSidebar')?.setAttribute('aria-hidden','false')}
function reflectDraft(detail={}){const dock=$('publishDock');if(!dock)return;dock.classList.toggle('has-changes',Boolean(detail.hasChanges));const status=$('globalPublishStatus');if(status&&!detail.hasChanges&&!status.classList.contains('success')&&!status.classList.contains('error'))status.textContent=detail.enabled===false?'Instant Mode is enabled.':'Draft workspace is clean.'}
export function navigateWorkspace(name,{scroll=true}={}){
  const target=document.querySelector(`[data-workspace="${name}"]`);if(!target)return;
  document.querySelectorAll('[data-workspace]').forEach(section=>{section.hidden=section!==target;section.classList.toggle('is-active',section===target)});
  document.querySelectorAll('[data-workspace-target]').forEach(button=>{const active=button.dataset.workspaceTarget===name;button.classList.toggle('active',active);if(button.matches('.sidebar-link'))button.setAttribute('aria-current',active?'page':'false')});
  const meta=workspaceMeta[name]||workspaceMeta.overview;
  if($('workspaceTitle'))$('workspaceTitle').textContent=meta.title;
  if($('workspaceDescription'))$('workspaceDescription').textContent=meta.description;
  storeWorkspace(name);closeMenu();if(scroll)window.scrollTo({top:0,behavior:'smooth'});
  window.dispatchEvent(new CustomEvent('immortal:workspace-change',{detail:{workspace:name}}));
}
function openMenu(){document.body.classList.add('admin-menu-open');$('adminSidebar')?.setAttribute('aria-hidden','false')}
export function initAdminLayout(){
  document.querySelectorAll('[data-workspace-target]').forEach(button=>button.addEventListener('click',()=>navigateWorkspace(button.dataset.workspaceTarget)));
  $('mobileMenuButton')?.addEventListener('click',()=>document.body.classList.contains('admin-menu-open')?closeMenu():openMenu());
  $('sidebarCloseButton')?.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();closeMenu()});$('sidebarBackdrop')?.addEventListener('click',closeMenu);
  window.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('admin-menu-open'))closeMenu()});
  window.addEventListener('immortal:navigate',event=>navigateWorkspace(event.detail?.workspace||'overview'));
  window.addEventListener('immortal:draft-change',event=>reflectDraft(event.detail));
  const saved=storedWorkspace();navigateWorkspace(workspaceMeta[saved]?saved:'overview',{scroll:false});
}
