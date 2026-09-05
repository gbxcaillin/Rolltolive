const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(); const errors=[];
  const mk=async(name)=>{ const page=await browser.newPage({ viewport:{width:1000,height:640} }); page.on('pageerror',e=>errors.push(name+' pageerror: '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push(name+' console: '+m.text()); });
    await page.goto('file://'+require('path').resolve(__dirname,'../index.html')); await page.waitForTimeout(150); await page.click('[data-mode="online"]'); await page.fill('#srvUrl','ws://localhost:8787'); await page.fill('#roomCode','MIG1'); await page.fill('#playerName',name); await page.click('#connectBtn'); await page.waitForTimeout(400); return page; };
  const host=await mk('Host'), g1=await mk('GuestOne'), g2=await mk('GuestTwo'); await g2.waitForTimeout(300);
  await host.keyboard.press('1'); await g1.keyboard.press('3'); await g2.keyboard.press('6'); await g2.waitForTimeout(300);
  await host.click('#startBtn'); await g2.waitForTimeout(1000);
  // put GuestTwo into a fight with an AI on the host, and park another AI inside the duel circle
  await host.evaluate(()=>{ const g=window.__game, G=g.G; const two=G.ents.find(e=>e.name==='GuestTwo'); const ais=G.ents.filter(e=>!e.isHuman&&e.alive); ais[0].x=two.x+30; ais[0].y=two.y; ais[0].immune=two.immune=0; ais[1].x=two.x+10; ais[1].y=two.y+10; ais[1].name='Vulture'; g.startCombat(ais[0],two); });
  await g2.waitForTimeout(1200);
  const push=await host.evaluate(()=>{ const G=window.__game.G; const two=G.ents.find(e=>e.name==='GuestTwo'), v=G.ents.find(e=>e.name==='Vulture'); const c=window.__game.combats[0]; const cx=(c.f[0].x+c.f[1].x)/2, cy=(c.f[0].y+c.f[1].y)/2; return {vultureDist:Math.round(Math.hypot(v.x-cx,v.y-cy)), inCombat:two.inCombat}; });
  console.log('duel push-out:', JSON.stringify(push));
  const t0=await g1.evaluate(()=>window.__game.G.time);
  // host drops
  await host.close(); await g1.waitForTimeout(1500);
  const after=await g1.evaluate(()=>{ const g=window.__game; return {isHost:g.Net.isHost, state:g.state, time:g.G.time, hostEnt:(()=>{ const e=g.G.ents.find(e=>/Host/.test(e.name)); return {name:e.name,isHuman:e.isHuman}; })(), combats:g.combats.length, view:!!g.combat}; });
  const after2=await g2.evaluate(()=>{ const g=window.__game; return {isHost:g.Net.isHost, state:g.state, time:g.G.time, hostId:g.Net.hostId, view:!!g.combat, phase:g.combat&&g.combat.phase}; });
  console.log('after host drop  g1:', JSON.stringify(after), ' g2:', JSON.stringify(after2), 'time before', t0);
  await g2.waitForTimeout(1500);
  const later=await g2.evaluate(()=>({time:window.__game.G.time, alive:window.__game.G.alive, view:!!window.__game.combat, phase:window.__game.combat&&window.__game.combat.phase}));
  console.log('g2 later (snapshots from new host?):', JSON.stringify(later));
  // g2 plays out its fight through the new host
  let acted=0; for(let i=0;i<400;i++){ const st=await g2.evaluate(()=>{ const g=window.__game, c=g.combat; return c?{phase:c.phase, mine:c.f[c.turn]===g.localHuman()}:null; }); if(!st) break; if(st.phase==='choose'&&st.mine){ acted++; await g2.click('#cpBody .abt:not(:disabled)'); await g2.waitForTimeout(120); await g2.keyboard.press('Space'); await g2.waitForTimeout(900); } else await g2.waitForTimeout(250); }
  const res=await g2.evaluate(()=>{ const g=window.__game, me=g.localHuman(); return {actions:0, alive:me.alive, hp:Math.round(me.hp), immune:me.immune, hold:me.immuneHold, kills:me.kills}; }); res.actions=acted;
  console.log('g2 fight via new host:', JSON.stringify(res));
  // sanctuary hold: park an AI next to g2 on the new host, step 9s, immunity should still be >0
  const sanct=await g1.evaluate(()=>{ const g=window.__game, G=g.G; const two=G.ents.find(e=>e.name==='GuestOne'); if(!two.alive||two.inCombat) return 'g1 busy, skip'; two.immune=8; two.immuneHold=14; const ai=G.ents.find(e=>!e.isHuman&&e.alive&&!e.inCombat); ai.x=two.x+40; ai.y=two.y; ai.ai.state='wander'; ai.ai.pause=true; ai.ai.t=99; const before=two.immune; g.step(9*60); const mid=two.immune; g.step(8*60); return {before, after9s:Math.round(mid*10)/10, after17s:Math.round(two.immune*10)/10, aiDist:Math.round(Math.hypot(ai.x-two.x,ai.y-two.y))}; });
  console.log('sanctuary hold:', JSON.stringify(sanct));
  // g2 moves, new host sees it
  await g2.keyboard.down('KeyA'); await g2.waitForTimeout(800); await g2.keyboard.up('KeyA'); await g2.waitForTimeout(300);
  console.log('g2 pos host-side vs client:', await g1.evaluate(()=>{ const e=window.__game.G.ents.find(e=>e.name==='GuestTwo'); return [e.x|0,e.y|0]; }), await g2.evaluate(()=>{ const e=window.__game.localHuman(); return [e.x|0,e.y|0]; }));
  console.log('errors:', errors.length?errors:'none'); await browser.close();
})().catch(e=>{ console.error('FAILED',e); process.exit(1); });
