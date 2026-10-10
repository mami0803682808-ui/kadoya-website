import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {shift} from './gsc.mjs';
const key=r=>`${r.keyword}\t${r.targetPath}`;
export function delta(before,after) {
  if(before?.status!=='measured'||after?.status!=='measured') return null;
  return {rank:after.rank-before.rank,impressions:after.impressions-before.impressions,clicks:after.clicks-before.clicks,ctr:after.ctr-before.ctr};
}
export function analyze(input,log=[]) {
  const {current,baseline}=input;
  const before=new Map(baseline.discovery.map(r=>[key(r),r]));
  const candidates=[];
  for(const row of current.discovery) {
    if(row.impressions<30) continue;
    const old=before.get(key(row)), change=delta(old,row);
    const observing=log.some(entry=>entry.targetPath===row.targetPath&&entry.actions?.some(action=>shift(action.date.slice(0,10),28)>current.endDate));
    if(observing) continue;
    const reasons=[];
    if(change?.rank>=2) reasons.push('平均掲載順位が2以上低下');
    if(old?.clicks>=5&&row.clicks/old.clicks<0.8) reasons.push('クリック数が20%以上減少');
    if(row.rank<=20&&row.ctr<0.03) reasons.push('20位以内・CTRが3%未満');
    if(!old&&row.rank<=20) reasons.push('新しい検索語の表示機会');
    if(reasons.length) candidates.push({...row,previous:old||null,change,reasons,priorityScore:row.impressions*reasons.length,
      suggestion:row.rank<=10?'検索語とtitle・説明文の一致、料理写真から営業時間・価格への導線を確認':'検索意図に合う料理情報、アクセス、関連ページへのリンクを確認'});
  }
  candidates.sort((a,b)=>b.priorityScore-a.priorityScore);
  const effects=[];
  for(const entry of log) for(const action of entry.actions||[]) {
    const date=action.date?.slice(0,10); if(!date) continue;
    const reviewAt=shift(date,28);
    const result=period=>period.results.find(r=>r.keyword===entry.keyword&&r.targetPath===entry.targetPath);
    // Only compare full pre-change and post-change periods; never compare an overlapping month.
    const comparable=baseline.endDate<date&&current.startDate>=date&&current.endDate>=reviewAt;
    effects.push({keyword:entry.keyword,targetPath:entry.targetPath,actionDate:date,done:action.done,
      status:!comparable?'awaiting_nonoverlapping_periods':delta(result(baseline),result(current))?'measured':'insufficient_data',
      reviewAt,baseline:comparable?result(baseline)||null:null,current:comparable?result(current)||null:null,
      change:comparable?delta(result(baseline),result(current)):null,
      note:'変化は相関。季節性・検索需要・他の変更の影響を含み、改善施策の因果効果とは断定しない。'});
  }
  return {month:current.startDate.slice(0,7),source:'gsc',generatedAt:input.measuredAt,
    periods:{current:{startDate:current.startDate,endDate:current.endDate},baseline:{startDate:baseline.startDate,endDate:baseline.endDate}},
    totals:{current:current.totals,baseline:baseline.totals,change:delta(baseline.totals,current.totals)},
    watchwords:current.results.map(r=>({...r,change:delta(baseline.results.find(b=>key(b)===key(r)),r)})),
    candidates:candidates.slice(0,20),effects,
    limitations:['順位は固定順位ではなくGSCの平均掲載順位。','検索語の匿名化・API上位行制限により、検索語別の合計はサイト全体と一致しない。','月の日数・季節性・表示機会の変化を考慮する。データなしは0や圏外と断定しない。']};
}
export function markdown(report) {
  const fmt=x=>x==null?'未計測':typeof x==='number'?x.toFixed(2):String(x);
  return `# 角屋 SEO月次レポート ${report.month}\n\n前月と前々月の確定GSCデータを比較。\n\n`+
    `| 指標 | 対象月 | 比較月 |\n|---|---:|---:|\n`+['rank','impressions','clicks','ctr'].map(k=>`| ${k} | ${fmt(report.totals.current[k])} | ${fmt(report.totals.baseline[k])} |`).join('\n')+
    `\n\n## 改善候補\n\n`+(report.candidates.length?report.candidates.map(r=>`- **${r.keyword}** (${r.targetPath})：${r.reasons.join('、')}。平均順位 ${fmt(r.rank)}、表示 ${r.impressions}、クリック ${r.clicks}。${r.suggestion}`).join('\n'):'実測データに基づく候補なし。')+
    `\n\n## 変更の観察\n\n`+(report.effects.map(r=>`- ${r.keyword}：${r.actionDate} ${r.done}／${r.status}${r.change?`、平均順位差 ${fmt(r.change.rank)}、クリック差 ${r.change.clicks}`:''}`).join('\n')||'記録なし')+
    '\n\n'+report.limitations.map(s=>'- '+s).join('\n')+'\n';
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  const dir=path.resolve('data/seo'), inputDir=path.join(dir,'monthly-input');
  if(!fs.existsSync(inputDir)) throw new Error('No GSC monthly data available; cannot generate a measured report.');
  const log=JSON.parse(fs.readFileSync(path.join(dir,'improvement-log.json')));
  fs.mkdirSync(path.join(dir,'monthly'),{recursive:true});
  for(const file of fs.readdirSync(inputDir).filter(f=>f.endsWith('.json'))) {
    const report=analyze(JSON.parse(fs.readFileSync(path.join(inputDir,file))),log);
    fs.writeFileSync(path.join(dir,'monthly',file),JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(path.join(dir,'monthly',file.replace('.json','.md')),markdown(report));
  }
}
