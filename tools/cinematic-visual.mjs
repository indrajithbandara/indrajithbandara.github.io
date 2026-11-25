import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
mkdirSync('qa-screenshots',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
  for(const [label,base] of [['before','http://127.0.0.1:8001/'],['after','http://127.0.0.1:8000/']])for(const width of [390,1440]){
    const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'no-preference',...(label==='after'&&width===390?{recordVideo:{dir:'qa-screenshots',size:{width:390,height:844}}}:{})});const page=await context.newPage();await page.goto(base);await page.locator('#skills').evaluate(n=>n.scrollIntoView({block:'start',behavior:'instant'}));await page.waitForFunction(()=>document.querySelectorAll('.skill-count').length===14);await page.waitForTimeout(950);await page.screenshot({path:`qa-screenshots/cinematic-${label}-${width}.png`});if(label==='after'&&width===390){for(const id of ['experience','education','projects','contact']){await page.locator('#'+id).evaluate(n=>n.scrollIntoView({block:'start',behavior:'smooth'}));await page.waitForTimeout(1000);}}await context.close();
  }
}finally{await browser.close();}
