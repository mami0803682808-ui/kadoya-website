import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import puppeteer from 'puppeteer-core';
const base=process.env.SITE_URL||'https://komaki-kadoya.com';
const output=process.env.CHECK_OUTPUT||'/tmp/kadoya-production-check.json';
const paths=['index.html','style-base.css','style.css','script-base.js','script.js','media-loading.js','images/optimized/kadoya-logo-lossless.webp',...['kishimen','morning','misonikomi','teishoku','misokatsu','dengaku'].map(p=>p+'/index.html')];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const result={checkedAt:new Date().toISOString(),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),base,files:[],layouts:[],status:'failed'};
let browser;
try {
  // Wait for the independently managed Cloudflare deployment; never report stale assets as success.
  for(let attempt=0;attempt<20;attempt++) {
    result.files=await Promise.all(paths.map(async file=>{
      const route=file==='index.html'?'/':'/'+file.replace(/\/index.html$/,'/');
      try {
        const response=await fetch(new URL(route,base),{signal:AbortSignal.timeout(20000),cache:'no-store'});
        return {file,status:response.status,matches:response.ok&&hash(Buffer.from(await response.arrayBuffer()))===hash(fs.readFileSync(file))};
      } catch(error) {return {file,matches:false,error:error.message};}
    }));
    if(result.files.every(f=>f.matches))break;
    if(attempt===19)throw new Error('Published files do not match the checked-out source.');
    await new Promise(r=>setTimeout(r,30000));
  }
  const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium-browser','/usr/bin/chromium'].find(p=>fs.existsSync(p));
  browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});
  for(const width of [375,1280]) {
    const page=await browser.newPage();await page.setViewport({width,height:900,deviceScaleFactor:1});
    for(const route of ['/','/teishoku/','/kishimen/','/morning/','/misonikomi/','/misokatsu/','/dengaku/']) {
      const response=await page.goto(new URL(route,base).href,{waitUntil:'networkidle0'});
      if(!response.ok())throw new Error(`HTTP ${response.status()} ${route}`);
      const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),phone:[...document.querySelectorAll('a[href^="tel:"]')].map(a=>a.getAttribute('href'))}));
      if(state.overflow||state.brokenImages.length||!state.phone.includes('tel:0568722127'))throw new Error(`Layout failed: ${width} ${route} ${JSON.stringify(state)}`);
      if(route==='/') {
        await page.click('.opening-shortcuts a[href="#menu"]');
        await page.waitForFunction(()=>Math.abs(document.querySelector('#menu').getBoundingClientRect().top)<250);
        for(const key of ['set','noodle','side','morning','season']) {
          await page.click(`[data-menu-tab="${key}"]`);
          await page.waitForFunction(key=>document.querySelector(`[data-menu-tab="${key}"]`).getAttribute('aria-selected')==='true'&&!document.querySelector(`[data-menu-panel="${key}"]`).hidden,{},key);
        }
      }
      result.layouts.push({route,width,...state});
    }
    await page.close();
  }
  result.status='passed';
} catch(error) {result.error=error.message;process.exitCode=1;}
finally {
  if(browser)await browser.close();fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result));
}
