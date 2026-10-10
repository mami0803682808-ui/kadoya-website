import fs from 'node:fs';
import puppeteer from 'puppeteer-core';
const executablePath=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium-browser','/usr/bin/chromium'].find(p=>fs.existsSync(p));
if(!executablePath)throw new Error('Chrome missing; responsive layout validation was not performed.');
const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});
const results=[];
try {
  for(const width of [375,1280]) {
    const page=await browser.newPage();await page.setViewport({width,height:900,deviceScaleFactor:1});
    for(const route of ['kishimen','morning','misonikomi','teishoku','misokatsu','dengaku']) {
      await page.goto(`http://localhost:8080/${route}/`,{waitUntil:'networkidle0'});
      const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,title:document.title,h1:document.querySelectorAll('h1').length,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
      if(result.overflow||result.h1!==1||result.brokenImages.length)throw new Error(`Layout failed: ${route}, width ${width}, ${JSON.stringify(result)}`);
      results.push({route,width,...result});
      if(route==='morning')await page.screenshot({path:`data/seo/performance/morning-${width}.png`,fullPage:true});
    }
    await page.close();
  }
  fs.writeFileSync('data/seo/performance/layout-check.json',JSON.stringify(results,null,2)+'\n');
  console.log('All six intent pages passed at mobile 375px and desktop 1280px.');
} finally {await browser.close();}
