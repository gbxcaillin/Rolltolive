const { chromium } = require('playwright');
const out=require('path').join(__dirname,'shots'); require('fs').mkdirSync(out,{recursive:true});
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  const errors=[]; page.on('pageerror', e => errors.push('pageerror: '+e.message)); page.on('console', m => { if(m.type()==='error') errors.push('console: '+m.text()); });
  await page.goto('file://'+require('path').resolve(__dirname,'../index.html')); await page.waitForTimeout(150); await page.evaluate(()=>window.__game.skipTitle()); await page.waitForTimeout(300);
  await page.screenshot({ path: out + '/s01_menu.png' });
  await page.click('[data-mode="solo"]'); await page.waitForTimeout(200); await page.screenshot({ path: out + '/s02_select.png' });
  await page.keyboard.press('2'); await page.waitForTimeout(400);
  const st0 = await page.evaluate(()=>{ const g=window.__game, me=g.localHuman(); return {state:g.state, weapon:me.weapon.name, abilities:g.abilityList(me)}; });
  console.log('start:', JSON.stringify(st0));
  // give a weapon via crate loop: force weapon and medkits
  const st1 = await page.evaluate(()=>{ const g=window.__game, me=g.localHuman(); me.weapon=g.makeWeapon('tech',2); me.medkits=1; me.hp=30; const ab=g.abilityList(me); g.tryMedkit(); const upg=(()=>{ g.tryAction(); return me.weapon.tier; })(); return {ab, hpAfterMed:Math.round(me.hp), tierAfterUpgrade:upg, en:me.energy}; });
  console.log('progression:', JSON.stringify(st1));
  await page.screenshot({ path: out + '/s03_world.png' });
  // engage AI, world keeps running
  await page.evaluate(()=>{ const g=window.__game, G=g.G, me=g.localHuman(); const ai=G.ents.find(e=>!e.isHuman&&e.alive); ai.x=me.x+30; ai.y=me.y; ai.immune=0; me.immune=0; g.tryEngage(); });
  await page.waitForTimeout(1500); await page.screenshot({ path: out + '/s04_combat_intro.png' });
  let shots=0;
  for(let i=0;i<300;i++){ const st=await page.evaluate(()=>{ const g=window.__game, c=g.combat; return c?{phase:c.phase, mine:c.f[c.turn]===g.localHuman(), hp:c.f.map(f=>Math.round(f.hp)), time:g.G.time}:null; }); if(!st) break;
    if(st.phase==='choose'&&st.mine){ if(shots++===0) await page.screenshot({ path: out + '/s05_combat_choose.png' }); await page.click('#cpBody .abt:not(:disabled)'); await page.waitForTimeout(100); if(shots===1) await page.screenshot({ path: out + '/s06_await.png' }); await page.keyboard.press('Space'); await page.waitForTimeout(1000); if(shots===1) await page.screenshot({ path: out + '/s07_resolve.png' }); } else await page.waitForTimeout(300); }
  const st2 = await page.evaluate(()=>{ const g=window.__game; return {state:g.state, alive:g.G.alive, time:Math.round(g.G.time), combats:g.combats.length, me:g.localHuman().alive}; });
  console.log('after combat:', JSON.stringify(st2));
  // death → end → restart
  await page.evaluate(()=>{ const g=window.__game; g.killContestant(g.localHuman(),null); }); await page.waitForTimeout(2500);
  console.log('after death:', await page.evaluate(()=>window.__game.state)); await page.screenshot({ path: out + '/s08_end.png' });
  await page.click('#againBtn'); await page.waitForTimeout(200); console.log('menu:', await page.evaluate(()=>window.__game.state+' G='+(window.__game.G===null)));
  // hotseat sanity
  await page.click('[data-mode="hotseat"][data-humans="2"]'); await page.waitForTimeout(100); await page.keyboard.press('3'); await page.waitForTimeout(100); await page.keyboard.press('6'); await page.waitForTimeout(200);
  console.log('hotseat:', await page.evaluate(()=>window.__game.state)); await page.click('#passBtn'); await page.waitForTimeout(100);
  const hv = await page.evaluate(()=>{ const g=window.__game, G=g.G; const p1=G.ents[0], p2=G.ents[1]; p2.x=p1.x+30; p2.y=p1.y; p1.immune=p2.immune=0; g.tryEngage();
    for(let i=0;i<5000 && g.combat;i++){ const c=g.combat; if(c.phase==='choose'&&c.f[c.turn].isHuman){ g.uiChoose('attack'); g.uiRoll(); } g.step(6); } return {p1:p1.alive,p2:p2.alive,state:g.state,alive:G.alive, view:!!g.combat}; });
  console.log('hotseat HvH:', JSON.stringify(hv));
  // win
  await page.evaluate(()=>{ const g=window.__game, G=g.G; const me=g.localHuman(); G.ents.filter(e=>e!==me).forEach(e=>g.killContestant(e,me)); me.x=G.barge.x; me.y=G.barge.y; }); await page.waitForTimeout(2000);
  console.log('win:', await page.evaluate(()=>window.__game.state)); await page.screenshot({ path: out + '/s09_win.png' });
  console.log('errors:', errors.length?errors:'none'); await browser.close();
})().catch(e=>{ console.error('FAILED',e); process.exit(1); });
