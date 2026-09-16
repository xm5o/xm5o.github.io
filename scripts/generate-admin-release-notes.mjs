import{readFile,writeFile}from'node:fs/promises';
import{execFileSync}from'node:child_process';
const input=process.env.RELEASE_FILE||'admin/profile/release.json';
const output=process.env.RELEASE_NOTES_FILE||'admin/profile/release-notes.generated.json';
const release=JSON.parse(await readFile(input,'utf8'));
let raw='';try{raw=execFileSync('git',['log','-30','--pretty=format:%H%x09%cI%x09%s','--','admin/profile','cloudflare/profile-uploader'],{encoding:'utf8'})}catch{}
const commits=raw.split('\n').filter(Boolean).map(line=>{const[sha,date,...rest]=line.split('\t');return{sha,shortSha:sha.slice(0,7),date,message:rest.join('\t')}}).filter(x=>!/generated release notes/i.test(x.message)).slice(0,20);
const out={version:release.version,name:release.name,channel:release.channel||(/beta/i.test(input)?'beta':'stable'),releasedAt:release.releasedAt,generatedAt:new Date().toISOString(),commits};
await writeFile(output,`${JSON.stringify(out,null,2)}\n`);console.log(`Generated ${commits.length} release-note commit(s) for ${out.channel} v${out.version}.`);
