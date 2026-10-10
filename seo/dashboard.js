(async()=>{
  const read=async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('No data');return r.json();};
  const text=(selector,value)=>document.querySelector(selector).textContent=value;
  const fmt=value=>value==null?'未計測':Number(value).toLocaleString('ja-JP',{maximumFractionDigits:2});
  try {
    const history=await read('/data/seo/rank-history.json');const latest=history.filter(s=>s.source==='gsc').at(-1);
    if(!latest)text('#status','Search Consoleの実測データはまだありません。認証設定の修復が必要です。');
    else {
      text('#status',`最終取得 ${latest.measuredAt} ／ 対象 ${latest.startDate}〜${latest.endDate}。取得失敗は上部の実行履歴で確認してください。`);
      for(const r of latest.results){const item=document.createElement('p');item.textContent=`${r.keyword} (${r.targetPath})：平均順位 ${fmt(r.rank)} ／ 表示 ${fmt(r.impressions)} ／ クリック ${fmt(r.clicks)} ／ CTR ${r.ctr==null?'未計測':fmt(r.ctr*100)+'%'}。サイト全体の平均順位 ${fmt(r.siteMetrics?.rank)}`;document.querySelector('#keywords').append(item);}
    }
  }catch{text('#status','履歴を読み込めません。実行履歴で収集状況を確認してください。');}
  // Use the last completed calendar month in Japan; a missing report stays visibly unavailable.
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit'}).formatToParts(new Date());
  let y=Number(parts.find(p=>p.type==='year').value),m=Number(parts.find(p=>p.type==='month').value)-1;if(m===0){m=12;y--;}
  const month=`${y}-${String(m).padStart(2,'0')}`;
  try {
    const r=await read(`/data/seo/monthly/${month}.json`);text('#monthly',`${month}：確定実測データから抽出。`);
    for(const c of r.candidates){const p=document.createElement('p');p.textContent=`${c.keyword}：${c.reasons.join('・')}。${c.suggestion}`;document.querySelector('#candidates').append(p);}
    if(!r.candidates.length)text('#candidates','改善候補なし。');
    for(const e of r.effects){const p=document.createElement('p');p.textContent=`変更の観察：${e.keyword}／${e.status}${e.change?`／平均順位差 ${fmt(e.change.rank)}、クリック差 ${fmt(e.change.clicks)}`:''}`;document.querySelector('#candidates').append(p);}
  }catch{text('#monthly',`${month}のレポートはまだありません。毎月6日の取得後に作成します。`);}
  try {for(const r of await read('/data/seo/performance/latest.json')){const p=document.createElement('p');p.textContent=`${r.mode}／${r.measuredAt}：性能 ${fmt(r.performance*100)}、LCP ${fmt(r.lcpMs/1000)}秒、CLS ${fmt(r.cls)}。現行ソースのラボ測定で、実ユーザーの体感速度とは異なります。`;document.querySelector('#performance').append(p);}}
  catch{text('#performance','Lighthouseの実測結果はまだありません。計測ワークフローの実行履歴を確認してください。');}
})();
