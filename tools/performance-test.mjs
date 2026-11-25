import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as launcher from 'chrome-launcher';
import {chromium} from 'playwright';
const cases=process.env.LIGHTHOUSE_PRODUCTION_URL?[['production',process.env.LIGHTHOUSE_PRODUCTION_URL],['production-platform',new URL('platform.html',process.env.LIGHTHOUSE_PRODUCTION_URL).href]]:[['before','http://127.0.0.1:8001/'],['after','http://127.0.0.1:8000/'],['before-platform','http://127.0.0.1:8001/platform.html'],['platform','http://127.0.0.1:8000/platform.html']];
for(const [label,url] of cases){
  for(const device of ['mobile','desktop']){
    const chrome=await launcher.launch({chromePath:chromium.executablePath(),chromeFlags:['--headless=new','--no-sandbox','--disable-dev-shm-usage']});
    try{
      const result=await lighthouse(url,{port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},device==='desktop'?desktopConfig:undefined);
      console.log('LIGHTHOUSE '+JSON.stringify({label,device,scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift'].map(k=>[k,result.lhr.audits[k]?.displayValue]))}));
      console.log('LIGHTHOUSE AUDITS '+JSON.stringify({label,device,findings:Object.values(result.lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,score:a.score,display:a.displayValue}))}));
    }finally{await chrome.kill();}
  }
}
