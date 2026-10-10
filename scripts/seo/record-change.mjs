import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const commit=process.env.CHANGE_SHA;
if(!/^[a-f0-9]{40}$/.test(commit||'')) throw new Error('CHANGE_SHA must be a full Git commit SHA');
const files=execFileSync('git',['diff-tree','--no-commit-id','--name-only','-r',commit],{encoding:'utf8'}).trim().split('\n');
const date=execFileSync('git',['show','-s','--format=%cI',commit],{encoding:'utf8'}).trim();
const message=execFileSync('git',['show','-s','--format=%s',commit],{encoding:'utf8'}).trim();
const data='data/seo/',log=JSON.parse(fs.readFileSync(data+'improvement-log.json'));
const history=JSON.parse(fs.readFileSync(data+'rank-history.json'));
const latest=history.filter(s=>s.source==='gsc'&&s.measuredAt<date).at(-1);
for(const word of JSON.parse(fs.readFileSync(data+'watchwords.json'))) {
  const affected=files.filter(f=>f==='index.html'||f===word.targetPath.slice(1)+'index.html'||/^(style.*\.css|script.*\.js|menu-pages.css|media-loading.js|images\/)/.test(f));
  if(!affected.length) continue;
  let entry=log.find(r=>r.keyword===word.keyword&&r.targetPath===word.targetPath);
  if(!entry){entry={keyword:word.keyword,targetPath:word.targetPath,actions:[]};log.push(entry);}
  if(entry.actions.some(a=>a.commit===commit))continue;
  const baseline=latest?.results.find(r=>r.keyword===word.keyword&&r.targetPath===word.targetPath);
  entry.status='observing';const next=new Date(date);next.setUTCDate(next.getUTCDate()+28);entry.nextReviewDate=next.toISOString().slice(0,10);
  entry.actions.push({date,commit,files:affected,rankAtAction:baseline?.rank??null,baseline:baseline||null,done:message,needs:'検索意図別の料理案内・表示性能の改善。効果は確定GSCデータで観察する。'});
}
fs.writeFileSync(data+'improvement-log.json',JSON.stringify(log,null,2)+'\n');
