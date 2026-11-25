import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as launcher from 'chrome-launcher';
import {chromium} from 'playwright';
for(const [label,url] of [['before','http://127.0.0.1:8001/'],['after','http://127.0.0.1:8000/']]){
  for(const device of ['mobile','desktop']){
    const chrome=await launcher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless=new','--no-sandbox','--disable-dev-shm-usage']});
    try{
      const result=await lighthouse(url,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},device==='desktop'?desktopConfig:undefined);
      console.log('LIGHTHOUSE '+JSON.stringify({label,device,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift'].map(k=>[k,result.lhr.audits[k]?.displayValue]))}));
    }finally{await chrome.kill();}
  }
}
