const { chromium } = require('playwright');
(async () => { const browser=await chromium.launch(); const page=await browser.newPage({viewport:{width:1000,height:640}}); const errs=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto('file://'+require('path').resolve(__dirname,'../index.html')); await page.waitForTimeout(200);
  for(let run=0;run<3;run++){
    await page.click('[data-mode="solo"]'); await page.keyboard.press(String(1+run*2)); await page.waitForTimeout(200);
    const r=await page.evaluate(()=>{ const g=window.__game; const viol=[]; let fights=0, maxRounds=0; let t=0;
      for(let i=0;i<420*2 && g.state==='play';i++){ const G=g.G, me=g.localHuman();
        for(const c of g.combats){ if(!c.f.includes(me)) viol.push('no-human:'+c.f.map(f=>f.name).join('v')+':'+c.phase); else if(g.combat!==c) viol.push('unviewed:'+c.f.map(f=>f.name).join('v')+':'+c.phase); if(c.round>maxRounds) maxRounds=c.round; }
        if(g.combat){ const c=g.combat; if(c.phase==='intro'&&c.t<0.1) fights++; if(c.phase==='choose'&&c.f[c.turn]===me){ const ids=g.abilityList(me).filter(id=>id!=='flee'); g.uiChoose(ids[ids.length-2]||'attack'); if(c.phase==='choose') g.uiChoose('attack'); g.uiRoll(); } }
        else if(me.alive){ const dx=G.zone.cx-me.x, dy=G.zone.cy-me.y; for(const [k,v] of Object.entries({KeyW:dy<-20,KeyS:dy>20,KeyA:dx<-20,KeyD:dx>20})) window.dispatchEvent(new KeyboardEvent(v?'keydown':'keyup',{code:k})); }
        g.step(30); t+=0.5; }
      for(const k of ['KeyW','KeyS','KeyA','KeyD']) window.dispatchEvent(new KeyboardEvent('keyup',{code:k}));
      const G=g.G, me=g.localHuman(); return {state:g.state, time:Math.round(G.time), alive:G.alive, meAlive:me.alive, kills:me.kills, weapon:me.weapon.name, fights, maxRounds, viol:[...new Set(viol)].slice(0,5), killLog:G.killLog.map(k=>k.k+'>'+k.v+'@'+k.t).join(', ')}; });
    console.log('run',run,JSON.stringify(r));
    if(await page.evaluate(()=>window.__game.state)==='end') await page.click('#againBtn'); else { await page.evaluate(()=>{ window.__game.state='play'; document.getElementById('combatPanel').classList.add('hidden'); }); await page.keyboard.press('Escape'); await page.waitForTimeout(100); await page.click('#quitBtn'); }
    await page.waitForTimeout(200); }
  console.log('errors',errs); await browser.close(); })();
