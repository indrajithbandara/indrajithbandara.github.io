import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({reducedMotion:'reduce'});
  await page.route('https://api.github.com/**',route=>route.abort());
  await page.route('https://dev.to/**',route=>route.abort());
  await page.goto(process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/');
  await page.waitForFunction(()=>document.getElementById('cd-status').textContent==='Showing 1–18 of 280 records');
  assert.equal(await page.locator('.cd-card').count(),18);
  await page.locator('#cd-more').click();assert.match(await page.locator('#cd-status').innerText(),/19–36/);
  await page.locator('#cd-search').fill('Google IT Support');assert.match(await page.locator('#cd-status').innerText(),/of 1 records/);
  await page.locator('#cd-issuer').selectOption('Coursera');assert.equal(await page.locator('.cd-card').count(),1);
  await page.locator('.cd-card button').first().click();assert.ok(await page.locator('#cd-dialog').isVisible());await page.keyboard.press('Escape');assert.ok(!(await page.locator('#cd-dialog').isVisible()));
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#cd-export').click()]);assert.equal(download.suggestedFilename(),'credentials-filtered.csv');
  await page.locator('#cd-reset').click();await page.locator('#cd-sort').selectOption('old');assert.match(await page.locator('.cd-card').first().innerText(),/2021-03-23/);
  for(const width of [320,360,390,430,768,1024,1440]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Horizontal overflow at ${width}px`);}
  await page.locator('#themeToggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  console.log('Directory, pagination, combined filters, details, CSV, sort, responsive widths and theme passed.');
}finally{await browser.close();}
