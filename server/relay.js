#!/usr/bin/env node
// Outborn reference relay server. Zero dependencies: node server/relay.js [port]
// Implements the room/relay contract in NETWORK.md so the game can be played across devices.
// Your own server only needs to speak the same JSON messages (see NETWORK.md).
'use strict';
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path');
const PORT = parseInt(process.argv[2] || process.env.PORT || '8787', 10);
// Static hosting: serves PUBLIC_DIR (default ../public next to this file) so one process hosts the game and the relay.
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, '..', 'public');
const MIME = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.css':'text/css','.md':'text/markdown; charset=utf-8','.ico':'image/x-icon'};
const MAX_ROOM = 10, MAX_MSG = 64 * 1024;
const rooms = new Map();   // room -> { host:id, clients: Map<id, client> }
let nextId = 1;

// ---- minimal RFC 6455 framing ----
function encodeFrame(str){ const p=Buffer.from(str); const n=p.length; let h;
  if(n<126){ h=Buffer.alloc(2); h[1]=n; } else if(n<65536){ h=Buffer.alloc(4); h[1]=126; h.writeUInt16BE(n,2); } else { h=Buffer.alloc(10); h[1]=127; h.writeBigUInt64BE(BigInt(n),2); }
  h[0]=0x81; return Buffer.concat([h,p]); }
function attach(sock, onMsg, onClose){
  let buf=Buffer.alloc(0), closed=false;
  const close=()=>{ if(closed) return; closed=true; try{ sock.end(); }catch(e){} onClose(); };
  sock.on('data', d=>{ buf=Buffer.concat([buf,d]);
    for(;;){ if(buf.length<2) return; const fin=buf[0]&0x80, op=buf[0]&0x0f, masked=buf[1]&0x80; let len=buf[1]&0x7f, off=2;
      if(len===126){ if(buf.length<4) return; len=buf.readUInt16BE(2); off=4; } else if(len===127){ if(buf.length<10) return; len=Number(buf.readBigUInt64BE(2)); off=10; }
      if(len>MAX_MSG){ close(); return; } if(masked) off+=4; if(buf.length<off+len) return;
      let payload=buf.slice(off,off+len); if(masked){ const m=buf.slice(off-4,off); payload=Buffer.from(payload.map((b,i)=>b^m[i&3])); }
      buf=buf.slice(off+len);
      if(op===8){ close(); return; } if(op===9){ sock.write(Buffer.concat([Buffer.from([0x8a,payload.length]),payload])); continue; } if(op===10||!fin) continue;
      if(op===1) onMsg(payload.toString('utf8')); } });
  sock.on('close', close); sock.on('error', close);
  return { send: s=>{ if(!closed) try{ sock.write(encodeFrame(s)); }catch(e){} }, close };
}
// ---- rooms ----
function broadcastRoom(room, obj, except){ const s=JSON.stringify(obj); for(const [id,c] of room.clients) if(id!==except) c.ws.send(s); }
function leave(c){ const room=rooms.get(c.room); if(!room) return; room.clients.delete(c.id);
  if(room.clients.size===0){ rooms.delete(c.room); return; }
  broadcastRoom(room, {t:'peer', id:c.id, name:c.name, on:false});
  if(room.host===c.id){ room.host=room.clients.keys().next().value; broadcastRoom(room,{t:'host', id:room.host}); } }
const server = http.createServer((req,res)=>{
  const url=(req.url||'/').split('?')[0];
  if(url==='/health'){ res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify({ok:true, rooms:rooms.size, players:[...rooms.values()].reduce((n,r)=>n+r.clients.size,0)})); return; }
  const rel = url==='/' ? '/index.html' : url;
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if(!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()){
    if(!fs.existsSync(path.join(PUBLIC_DIR,'index.html'))){ res.writeHead(200,{'Content-Type':'text/plain'}); res.end(`Outborn relay: ${rooms.size} room(s) open\n`); return; }
    res.writeHead(404,{'Content-Type':'text/plain'}); res.end('not found'); return; }
  res.writeHead(200,{'Content-Type': MIME[path.extname(file).toLowerCase()]||'application/octet-stream', 'Cache-Control': rel==='/index.html'?'no-cache':'public, max-age=3600'});
  fs.createReadStream(file).pipe(res);
});
server.on('upgrade',(req,sock)=>{
  const key=req.headers['sec-websocket-key']; if(!key){ sock.destroy(); return; }
  const accept=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
  const c={ id:'p'+(nextId++), name:'?', room:null, ws:null };
  c.ws=attach(sock, raw=>{
    let m; try{ m=JSON.parse(raw); }catch(e){ return; } if(!m||typeof m.t!=='string') return;
    if(m.t==='join'){ if(c.room) return; const name=String(m.room||'ASH-1').slice(0,16).toUpperCase(); c.name=String(m.name||'Survivor').slice(0,14);
      let room=rooms.get(name); if(!room){ room={host:c.id, clients:new Map()}; rooms.set(name,room); }
      if(room.clients.size>=MAX_ROOM){ c.ws.send(JSON.stringify({t:'error', m:'Room is full'})); return; }
      c.room=name; const peers=[...room.clients.values()].map(o=>({id:o.id,name:o.name})); room.clients.set(c.id,c);
      c.ws.send(JSON.stringify({t:'joined', id:c.id, host:room.host, peers})); broadcastRoom(room,{t:'peer', id:c.id, name:c.name, on:true}, c.id);
      console.log(`[${name}] ${c.name} joined as ${c.id}${room.host===c.id?' (host)':''}`); return; }
    if(m.t==='leave'){ leave(c); c.room=null; return; }
    if(m.t==='msg'){ const room=rooms.get(c.room); if(!room) return; const out=JSON.stringify({t:'msg', from:c.id, data:m.data});
      if(m.to==='all') { for(const [id,o] of room.clients) if(id!==c.id) o.ws.send(out); }
      else if(m.to==='host'){ const h=room.clients.get(room.host); if(h && h.id!==c.id) h.ws.send(out); }
      else { const o=room.clients.get(m.to); if(o) o.ws.send(out); } }
  }, ()=>{ if(c.room){ console.log(`[${c.room}] ${c.name} left`); leave(c); c.room=null; } });
});
server.listen(PORT, ()=>console.log(`Outborn relay listening on ws://localhost:${PORT}` + (fs.existsSync(path.join(PUBLIC_DIR,'index.html'))?` and serving ${PUBLIC_DIR}`:' (no public dir: relay only)')));
