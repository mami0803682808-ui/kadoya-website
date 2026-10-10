import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {metrics,parsePrivateKey,pacificDate,collectPeriod,connect} from '../scripts/seo/gsc.mjs';
import {analyze,delta} from '../scripts/seo/analyze.mjs';
test('weighted average, missing data and CTR',()=>{
  assert.deepEqual(metrics([]),{rank:null,impressions:null,clicks:null,ctr:null,status:'no_data'});
  assert.equal(metrics([{impressions:10,clicks:2,position:2},{impressions:90,clicks:1,position:10}]).rank,9.2);
  assert.equal(metrics([{impressions:100,clicks:3,position:2}]).ctr,0.03);
});
test('credentials normalize actual escaped PEM and full JSON; damaged key rejected',()=>{
  const {privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
  const pem=privateKey.export({type:'pkcs8',format:'pem'});
  for(const raw of [pem,pem.replace(/\n/g,'\\n'),JSON.stringify(pem),JSON.stringify({client_email:'test',private_key:pem})]) assert.equal(parsePrivateKey(raw,'test').asymmetricKeyType,'rsa');
  assert.throws(()=>parsePrivateKey('broken','test'),/complete PEM/);
  assert.throws(()=>parsePrivateKey(JSON.stringify({client_email:'wrong',private_key:pem}),'test'),/mismatch/);
});
test('GSC date uses Pacific rather than UTC',()=>assert.equal(pacificDate(new Date('2026-10-11T00:00:00Z')),'2026-10-10'));
test('target and property queries are separate; new page can have no data',async()=>{
  const calls=[];
  const api={query:async body=>{calls.push(body); return body.dimensionFilterGroups?.[0].filters.length===1?[{position:8,impressions:50,clicks:2}]:[];}};
  const r=await collectPeriod(api,[{keyword:'小牧 きしめん',targetPath:'/kishimen/'}],'2026-09-01','2026-09-30');
  assert.equal(r.results[0].rank,null);assert.equal(r.results[0].siteMetrics.rank,8);
  assert.equal(calls[2].dimensionFilterGroups[0].filters[1].expression,'https://komaki-kadoya.com/kishimen/');
});
test('monthly differences and observation windows do not invent effects',()=>{
  const row={keyword:'test',targetPath:'/',rank:8,impressions:100,clicks:2,ctr:0.02,status:'measured'};
  const input={current:{startDate:'2026-09-01',endDate:'2026-09-30',totals:row,results:[row],discovery:[row]},baseline:{startDate:'2026-08-01',endDate:'2026-08-31',totals:{...row,rank:5},results:[{...row,rank:5}],discovery:[{...row,rank:5}]}};
  assert.equal(analyze(input).candidates[0].change.rank,3);
  assert.equal(delta({...row,status:'no_data'},row),null);
  const log=[{keyword:'test',targetPath:'/',actions:[{date:'2026-09-15',done:'changed'}]}];
  assert.equal(analyze(input,log).candidates.length,0);
  assert.equal(analyze(input,log).effects[0].status,'awaiting_nonoverlapping_periods');
});
test('OAuth failure does not disclose response body',async()=>{
  const {privateKey}=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
  await assert.rejects(()=>connect({GSC_CLIENT_EMAIL:'test',GSC_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'})},async()=>({ok:false,status:401,text:async()=> 'secret text'})),error=>!error.message.includes('secret text')&&error.message.includes('401'));
});
