import fs from 'node:fs';
const dir='data/seo/performance/';
const rows=['mobile','desktop'].map(mode=>{
  const r=JSON.parse(fs.readFileSync(dir+mode+'.json'));
  if(r.runtimeError) throw new Error('Lighthouse failed: '+r.runtimeError.code);
  return {mode,measuredAt:r.fetchTime,url:r.finalDisplayedUrl,sourceCommit:process.env.GITHUB_SHA||null,
    performance:r.categories.performance.score,accessibility:r.categories.accessibility.score,seo:r.categories.seo.score,
    lcpMs:r.audits['largest-contentful-paint'].numericValue,cls:r.audits['cumulative-layout-shift'].numericValue,
    tbtMs:r.audits['total-blocking-time'].numericValue,transferBytes:r.audits['total-byte-weight'].numericValue,
    limitations:'Local lab measurement of current source, not real-user or production CDN performance.'};
});
const file=dir+'history.json',history=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):[];
history.push(...rows);fs.writeFileSync(file,JSON.stringify(history,null,2)+'\n');
fs.writeFileSync(dir+'latest.json',JSON.stringify(rows,null,2)+'\n');
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'### 表示速度（Lighthouseのラボ測定）\n\n'+rows.map(r=>`- ${r.mode}: performance ${r.performance*100}, LCP ${(r.lcpMs/1000).toFixed(2)}秒, CLS ${r.cls.toFixed(3)}, 転送 ${(r.transferBytes/1024/1024).toFixed(2)}MiB`).join('\n')+'\n');
