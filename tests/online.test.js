const { chromium } = require('playwright');
const out=require('path').join(__dirname,'shots'); require('fs').mkdirSync(out,{recursive:true});
(async () => {
  const browser = await chromium.launch(); const errors=[];
  const mk=async(name)=>{ const page=await browser.newPage({ viewport:{width:1100,height:700} }); page.on('pageerror',e=>errors.push(name+' pageerror: '+e.message)); page.on('console',m=>{ if(m.type()==='error') errors.push(name+' console: '+m.text()); });
    await page.goto('file://'+require('path').resolve(__dirname,'../index.html')); await page.waitForTimeout(200); await page.click('[data-mode="online"]'); await page.fill('#srvUrl','ws://localhost:8787'); await page.fill('#roomCode','TEST1'); await page.fill('#playerName',name); await page.click('#connectBtn'); await page.waitForTimeout(500); return page; };
  const host=await mk('Host'), cli=await mk('Guest'); await cli.waitForTimeout(400);
  console.log('lobby host:', await host.evaluate(()=>({isHost:window.__game.Net.isHost, players:window.__game.Lobby.order().map(p=>p.name)})));
  await host.keyboard.press('1'); await cli.keyboard.press('6'); await cli.waitForTimeout(400);
  console.log('lobby picks:', await host.evaluate(()=>window.__game.Lobby.order().map(p=>p.name+':'+p.cls)));
  await host.screenshot({ path: out+'/o01_lobby.png' });
  await host.click('#startBtn'); await cli.waitForTimeout(800);
  const s1=await cli.evaluate(()=>{ const g=window.__game; const me=g.localHuman(); return {state:g.state, seed:g.G&&g.G.seed, me:me&&me.name, cls:me&&me.cls.id, ents:g.G.ents.length, pos:[me.x|0,me.y|0]}; });
  const s2=await host.evaluate(()=>{ const g=window.__game; return {state:g.state, seed:g.G.seed, guest:g.G.ents.find(e=>e.name==='Guest')&&[g.G.ents.find(e=>e.name==='Guest').x|0,g.G.ents.find(e=>e.name==='Guest').y|0]}; });
  console.log('client start:', JSON.stringify(s1)); console.log('host start:', JSON.stringify(s2));
  // client moves; host should see movement
  await cli.keyboard.down('KeyD'); await cli.waitForTimeout(1200); await cli.keyboard.up('KeyD'); await cli.waitForTimeout(300);
  const mv=await host.evaluate(()=>{ const e=window.__game.G.ents.find(e=>e.name==='Guest'); return [e.x|0,e.y|0]; }); const mvc=await cli.evaluate(()=>{ const e=window.__game.localHuman(); return [e.x|0,e.y|0]; });
  console.log('guest moved host-side:', mv, 'client-side:', mvc);
  await cli.screenshot({ path: out+'/o02_client_world.png' });
  // host teleports an AI next to the guest, guest engages
  await host.evaluate(()=>{ const G=window.__game.G; const g=G.ents.find(e=>e.name==='Guest'); const ai=G.ents.find(e=>!e.isHuman&&e.alive); ai.x=g.x+30; ai.y=g.y; ai.immune=0; g.immune=0; ai.ai.state='wander'; });
  await cli.waitForTimeout(300); await cli.keyboard.press('KeyE'); await cli.waitForTimeout(1800);
  console.log('client in combat:', await cli.evaluate(()=>{ const c=window.__game.combat; return c?{phase:c.phase, f:c.f.map(f=>f.name)}:null; }), 'host combats:', await host.evaluate(()=>window.__game.combats.length));
  await cli.screenshot({ path: out+'/o03_client_combat.png' });
  let acted=0;
  for(let i=0;i<300;i++){ const st=await cli.evaluate(()=>{ const g=window.__game, c=g.combat; return c?{phase:c.phase, mine:c.f[c.turn]===g.localHuman()}:null; }); if(!st) break;
    if(st.phase==='choose'&&st.mine){ acted++; await cli.click('#cpBody .abt:not(:disabled)'); await cli.waitForTimeout(150); await cli.keyboard.press('Space'); await cli.waitForTimeout(900); if(acted===1) await cli.screenshot({ path: out+'/o04_client_resolve.png' }); } else await cli.waitForTimeout(250); }
  console.log('client combat done, actions:', acted, await cli.evaluate(()=>{ const g=window.__game; const me=g.localHuman(); return {alive:me.alive, hp:me.hp, kills:me.kills, spectating:g.G.spectating, state:g.state, alive_count:g.G.alive}; }));
  console.log('host view of guest:', await host.evaluate(()=>{ const e=window.__game.G.ents.find(e=>e.name==='Guest'); return {alive:e.alive,hp:Math.round(e.hp),kills:e.kills,inCombat:e.inCombat}; }));
  // finish: host kills everyone except guest → barge → guest walks to it
  await host.evaluate(()=>{ const g=window.__game, G=g.G; const me=g.localHuman(); G.ents.filter(e=>e!==me&&e.alive).forEach(e=>g.killContestant(e,me)); me.x=G.barge.x; me.y=G.barge.y; });
  await cli.waitForTimeout(2500);
  console.log('end client:', await cli.evaluate(()=>({state:window.__game.state, big:document.getElementById('endBig').textContent})), 'end host:', await host.evaluate(()=>({state:window.__game.state, big:document.getElementById('endBig').textContent})));
  await cli.screenshot({ path: out+'/o05_client_end.png' });
  console.log('errors:', errors.length?errors:'none'); await browser.close();
})().catch(e=>{ console.error('FAILED',e); process.exit(1); });
