import fs from 'node:fs';
import path from 'node:path';
import {connect,collectPeriod,pacificDate,shift} from './gsc.mjs';
const get=name=>{const i=process.argv.indexOf(name);return i<0 ? undefined:process.argv[i+1];};
const repo=path.resolve(get('--repo')||process.cwd()), days=Number(get('--days')||28);
if(process.argv.includes('--help')) {console.log('Usage: collect.mjs [--repo PATH] [--days 1–90] [--append] [--monthly] [--site PROPERTY]');process.exit(0);}
if(!Number.isInteger(days)||days<1||days>90) throw new Error('--days must be an integer between 1 and 90');
const dir=path.join(repo,'data/seo'), read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'));
const write=(name,value)=>{const file=path.join(dir,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(value,null,2)+'\n');fs.renameSync(file+'.tmp',file);};
try {
  const env={...process.env,...(get('--site')?{GSC_SITE_URL:get('--site')}:{})};
  const api=await connect(env), today=pacificDate();
  const latest=await api.query({startDate:shift(today,-14),endDate:shift(today,-1),dimensions:['date']});
  const endDate=latest.map(r=>r.keys[0]).sort().at(-1);
  if(!endDate) throw new Error('No finalized Search Console data in the last 14 days. History was not updated.');
  const watchwords=read('watchwords.json');
  const current=await collectPeriod(api,watchwords,shift(endDate,1-days),endDate);
  const snapshot={measuredAt:new Date().toISOString(),source:'gsc',siteUrl:api.site,days,searchType:'web',dataState:'final',rankDefinition:'Search Console average position',...current};
  if(process.argv.includes('--append')) {
    const history=read('rank-history.json');
    if(!history.some(s=>s.source==='gsc'&&s.siteUrl===api.site&&s.startDate===snapshot.startDate&&s.endDate===endDate&&JSON.stringify(s.results)===JSON.stringify(snapshot.results))) {history.push(snapshot);write('rank-history.json',history);}
  } else console.log(JSON.stringify(snapshot,null,2));
  if(process.argv.includes('--monthly')) {
    const first=today.slice(0,7)+'-01', previousEnd=shift(first,-1), previousStart=previousEnd.slice(0,7)+'-01';
    const baselineEnd=shift(previousStart,-1), baselineStart=baselineEnd.slice(0,7)+'-01';
    if(endDate<previousEnd) throw new Error('Previous month is not finalized yet. Monthly report was not updated.');
    const periods={source:'gsc',siteUrl:api.site,measuredAt:new Date().toISOString(),current:await collectPeriod(api,watchwords,previousStart,previousEnd),baseline:await collectPeriod(api,watchwords,baselineStart,baselineEnd)};
    write(`monthly-input/${previousStart.slice(0,7)}.json`,periods);
  }
  console.log(`GSC success: ${current.startDate}–${endDate}; ${current.results.filter(r=>r.status==='measured').length}/${watchwords.length} target queries measured.`);
} catch(error) {console.error(error.message);process.exitCode=1;}
