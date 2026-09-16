import sharp from'sharp';
import{readdir,mkdir,readFile,rm,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import path from'node:path';
const root=process.cwd(),outDir=path.join(root,'assets/optimized');await mkdir(outDir,{recursive:true});
const sources=[
  {path:'assets/pfp.jpg',widths:[256,512,720]},
  {path:'assets/site-favicon.jpg',widths:[64,128,256,512]},
  {path:'assets/site-background.jpg',widths:[480,960,1440,1920]},
  {path:'assets/site-banner.jpg',widths:[480,960,1440,1600]}
];
const manifest={version:1,generatedAt:new Date().toISOString(),assets:{}};
for(const source of sources){let bytes;try{bytes=await readFile(path.join(root,source.path))}catch{continue}const input=sharp(bytes,{failOn:'none'}),meta=await input.metadata(),stem=path.basename(source.path,path.extname(source.path));for(const name of await readdir(outDir))if(name.startsWith(`${stem}-`)&&/\.(webp|avif)$/i.test(name))await rm(path.join(outDir,name));const widths=[...new Set(source.widths.filter(w=>!meta.width||w<=meta.width).concat(meta.width&&meta.width<Math.max(...source.widths)?[meta.width]:[]))].sort((a,b)=>a-b),entry={source:source.path,sha256:createHash('sha256').update(bytes).digest('hex'),width:meta.width||null,height:meta.height||null,webp:[],avif:[]};for(const width of widths){for(const format of['webp','avif']){const name=`${stem}-${width}.${format}`,target=path.join(outDir,name),pipeline=sharp(bytes,{failOn:'none'}).resize({width,withoutEnlargement:true});const result=format==='webp'?await pipeline.webp({quality:82,effort:5}).toFile(target):await pipeline.avif({quality:55,effort:5}).toFile(target);entry[format].push({width:result.width,height:result.height,path:`/assets/optimized/${name}`,bytes:result.size})}}manifest.assets[source.path]=entry}
await mkdir(path.join(root,'data'),{recursive:true});await writeFile(path.join(root,'data/optimized-assets.json'),`${JSON.stringify(manifest,null,2)}\n`);console.log(`Optimized ${Object.keys(manifest.assets).length} managed image source(s).`);
