import assert from 'node:assert/strict';
import {chromium,firefox,webkit} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';
import {mkdirSync} from 'node:fs';
const base=process.env.PORTFOLIO_URL||'http://127.0.0.1:8000/';
mkdirSync('qa-screenshots',{recursive:true});
for(const [name,engine] of Object.entries({chromium,firefox,webkit})){
  const browser=await engine.launch({headless:true});try{
    const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await page.route('https://images.credly.com/**',r=>r.abort());
    for(const path of ['index.html#skills','platform.html#skills']){
      await page.goto(base+path);const target=page.locator('.premium-skills-grid');await target.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelectorAll('.skill-count').length===14&&[...document.querySelectorAll('.skill-count')].every(n=>n.textContent.endsWith('related records')));
      assert.equal(await page.locator('.premium-skill summary').count(),14);await page.locator('.premium-skill summary').first().click();await page.locator('.premium-skill[open] .skill-evidence ul').waitFor({state:'visible'});assert.equal(await page.locator('.skill-accent-line').first().evaluate(e=>getComputedStyle(e).animationName),'none');
      for(const width of [320,360,375,390,414,430,768,1024,1440,1920]){await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name} ${path} overflow ${width}`);}
      for(const theme of ['dark','light']){await page.evaluate(t=>window.PortfolioPreferences.setTheme(t),theme);const axe=await new AxeBuilder({page}).include('.premium-skills-grid').withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(x=>({id:x.id,nodes:x.nodes.map(n=>n.target)}))));}
      if(name==='chromium'){await page.evaluate(()=>window.PortfolioPreferences.setTheme('dark'));await page.setViewportSize({width:390,height:844});await target.screenshot({path:`qa-screenshots/${path.startsWith('index')?'homepage':'platform'}-mobile.png`});await page.setViewportSize({width:1440,height:900});await target.screenshot({path:`qa-screenshots/${path.startsWith('index')?'homepage':'platform'}-desktop.png`});}
    }console.log('SKILLS PASS '+name+' — both views, evidence, reduced motion, accessibility, 10 widths');
  }finally{await browser.close();}
}
