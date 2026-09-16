import{chromium}from'playwright';
import pixelmatch from'pixelmatch';
import{PNG}from'pngjs';
import fs from'node:fs/promises';
import path from'node:path';

const base=process.env.SITE_TEST_URL||'http://127.0.0.1:4173';
const out=process.env.VISUAL_OUTPUT||'artifacts/site-current';
const baseline=process.env.VISUAL_BASELINE||'artifacts/site-baseline';
const diffDir=process.env.VISUAL_DIFF||'artifacts/site-diff';
const maxRatio=Number(process.env.VISUAL_MAX_DIFF||0.05);
const pages=[
  ['home','/'],
  ['commission','/commission/'],
  ['selina','/selina/'],
  ['privacy','/privacy.html'],
  ['not-found','/404.html']
];
const viewports=[['desktop',{width:1440,height:1000}],['mobile',{width:390,height:844}]];
await Promise.all([out,baseline,diffDir].map(dir=>fs.mkdir(dir,{recursive:true})));
const browser=await chromium.launch({headless:true});
const failures=[];

async function exists(file){try{await fs.access(file);return true}catch{return false}}
async function compare(name,currentPath){const basePath=path.join(baseline,name);if(!(await exists(basePath)))return{seed:true};const [a,b]=await Promise.all([fs.readFile(basePath),fs.readFile(currentPath)]),old=PNG.sync.read(a),cur=PNG.sync.read(b);if(old.width!==cur.width||old.height!==cur.height){failures.push(`${name}: dimensions changed ${old.width}x${old.height} -> ${cur.width}x${cur.height}`);return{ratio:1}}const diff=new PNG({width:cur.width,height:cur.height});const changed=pixelmatch(old.data,cur.data,diff.data,cur.width,cur.height,{threshold:.16,includeAA:false});const ratio=changed/(cur.width*cur.height);if(ratio>.002)await fs.writeFile(path.join(diffDir,name),PNG.sync.write(diff));if(ratio>maxRatio)failures.push(`${name}: ${(ratio*100).toFixed(2)}% visual difference (limit ${(maxRatio*100).toFixed(1)}%)`);return{ratio}}

for(const[viewportName,viewport]of viewports){const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));for(const[name,url]of pages){await page.goto(`${base}${url}`,{waitUntil:'domcontentloaded',timeout:30000});await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}'}).catch(()=>{});await page.waitForTimeout(900);await page.evaluate(()=>window.scrollTo(0,0));const file=`${name}-${viewportName}.png`,target=path.join(out,file);await page.screenshot({path:target,fullPage:true,animations:'disabled'});await compare(file,target);const overflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+4);if(!overflow)failures.push(`${name}-${viewportName}: horizontal overflow detected`)}if(errors.length)failures.push(`${viewportName}: page errors: ${errors.join(' | ')}`);await page.close()}
await browser.close();
if(failures.length){console.error('Whole-site visual checks failed:\n- '+failures.join('\n- '));process.exit(1)}
console.log(`Whole-site visual checks passed (${pages.length*viewports.length} screenshots, ${(maxRatio*100).toFixed(1)}% diff limit).`);
