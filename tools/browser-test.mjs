import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const serverless=process.env.PORTFOLIO_SERVERLESS_CHROMIUM?require('@sparticuz/chromium').default:null;
const browser=await chromium.launch({headless:true,...(serverless?{executablePath:await serverless.executablePath(),args:serverless.args}:{})});
try{
  const context=await browser.newContext({reducedMotion:'reduce'}),page=await context.newPage();
  await page.route('https://api.github.com/**',route=>route.abort());
  await page.route('https://dev.to/**',route=>route.abort());
  await page.goto(process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/');
  await page.locator('#badges').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.getElementById('cd-status').textContent==='Showing 1–18 of 280 records');
  assert.equal(await page.locator('.cd-card').count(),18);
  await page.locator('#cd-more').click();assert.match(await page.locator('#cd-status').innerText(),/19–36/);
  await page.locator('#cd-search').fill('Google IT Support');assert.match(await page.locator('#cd-status').innerText(),/of 1 records/);
  await page.locator('#cd-issuer').selectOption('Coursera');assert.equal(await page.locator('.cd-card').count(),1);
  await page.locator('.cd-card button').first().click();assert.ok(await page.locator('#cd-dialog').isVisible());await page.keyboard.press('Escape');assert.ok(!(await page.locator('#cd-dialog').isVisible()));
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#cd-export').click()]);assert.equal(download.suggestedFilename(),'credentials-filtered.csv');
  const [json]=await Promise.all([page.waitForEvent('download'),page.locator('#cd-json').click()]);assert.equal(json.suggestedFilename(),'public-credentials.json');
  await page.locator('#cd-reset').click();await page.locator('#cd-sort').selectOption('old');assert.match(await page.locator('.cd-card').first().innerText(),/2021-03-23/);
  for(const width of [320,360,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&e.getBoundingClientRect().width>0).slice(0,10).map(e=>[e.tagName,e.className,e.getBoundingClientRect().right])}));assert.ok(result.scrollWidth<=width+1,`Horizontal overflow at ${width}px: ${JSON.stringify(result)}`);}
  await page.locator('#github-stats').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('github-live-languages').textContent.includes('unavailable'));
  await page.locator('#blog').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('articles-container').textContent.includes('Unable'));
  await page.locator('#themeToggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  const {AxeBuilder}=require('@axe-core/playwright');
  for(const theme of ['light','dark']){if(theme==='dark')await page.locator('#themeToggle').click();const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();console.log('Axe '+theme+': '+JSON.stringify(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));assert.equal(results.violations.length,0,'Accessibility violations in '+theme);}
  console.log('Directory, pagination, combined filters, details, CSV, sort, responsive widths and theme passed.');
}finally{await browser.close();}
