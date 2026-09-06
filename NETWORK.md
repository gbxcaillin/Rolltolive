# Online play — protocol and wiring

The game is **host-authoritative**. One device (the first to join a room) simulates the whole
island: AI, zone, crates, every fight. The other devices send inputs and mirror 10 Hz snapshots.
The server only needs to be a **room relay**: it never runs game logic.

```
 client A (host) ──┐                     ┌── client B
                   ├──  your server  ────┤
 inputs / snapshots┘   (rooms + relay)   └── client C
```

`server/relay.js` is a zero-dependency Node implementation of this contract, used for local play
and as the reference: `node server/relay.js 8787`. To use your own server, make it speak the same
JSON messages over a WebSocket, or edit the `Net` object in `index.html` (about 40 lines, the only
code that touches the socket) to match what your server already speaks.

## 1. Relay contract (client ⇄ server)

All messages are JSON text frames.

| Direction | Message | Meaning |
|---|---|---|
| C→S | `{ "t":"join", "room":"ASH-1", "name":"Kes" }` | Join or create a room. First member becomes host. |
| S→C | `{ "t":"joined", "id":"p3", "host":"p1", "peers":[{"id":"p1","name":"Kes"}] }` | Your id, the host id, current members. |
| S→room | `{ "t":"peer", "id":"p3", "name":"Kes", "on":true }` | Member joined (`on:true`) or left (`on:false`). |
| S→room | `{ "t":"host", "id":"p2" }` | Host changed (old host left). Send it **after** the old host's `peer off`. |
| C→S | `{ "t":"msg", "to":"all" \| "host" \| "<peerId>", "data":{…} }` | Relay `data` to everyone else, the host, or one peer. |
| S→C | `{ "t":"msg", "from":"p1", "data":{…} }` | A relayed message. |
| C→S | `{ "t":"leave" }` | Leave the room (closing the socket also works). |
| S→C | `{ "t":"error", "m":"Room is full" }` | Refusal. |

Rooms hold up to 10 members. Messages are at most 64 KB. That is the whole contract.

## 2. Game messages (inside `data`)

Host → all (broadcast):

| `t` | Fields | When |
|---|---|---|
| `lobby` | `players:[{id,name,cls}]` | Lobby membership or class picks changed. |
| `start` | `seed`, `roster:[{id,name,clsId,human,humanIndex,netId}]` | Host starts. Clients build the identical island from `seed`. |
| `snap` | see below | Every 100 ms during play. |
| `ev` | `k:"toast"` + `text,kind,secs` · `k:"death"` + `x,y,c` | Kill feed, phase changes, death particles. |
| `end` | `r:"win"\|"lose"`, `who` (entity id) | Round over. |

Host → one client: `ev` toasts meant only for that player (loot, medkits), and
`cev` `{cid, a, ab, ev, nat}` = the resolved events of one combat action, so the client plays
the same particles, floating numbers and sounds as the host.

Client → host:

| `t` | Fields | Meaning |
|---|---|---|
| `pick` | `cls` | Lobby class choice. |
| `in` | `d:[dx,dy]`, `e:1?` | Movement vector (15 Hz or on change); `e` = engage pressed. |
| `act` | `ab` | Chosen ability id on my combat turn. |
| `roll` | | Roll the d20. |
| `back` | | Un-choose. |
| `med` / `upg` | | Use a medkit / Technomancer field upgrade. |

### Snapshot

```json
{ "t":"snap", "tm":83.2, "z":[cx,cy,radius,phase,phaseT], "al":7, "b":[x,y] | null, "over":0,
  "cr":[[x,y],…],
  "e":[[id,x,y,hp,maxHp,en,maxEn,alive,facing,moving,wType,wTier,wUpg,kills,immuneSecs,inCombat,def,atk,score,medkits,dmgDealt,crates,placement,armor,immuneHold,aggression,isHuman,fieldCd,scoutT,sprintT,prep,rite,burnGrace],…],
  "c":[{ "id":3, "f":[idA,idB], "turn":0, "round":2, "ph":"choose", "ch":null, "nat":14, "t":0.4, "fo":0,
         "dv":14, "dr":0, "dvis":1, "log":[{text,color}], "w":0, "l":0, "fl":0,
         "st":[[statuses of A],[statuses of B]], "cd":[{cooldowns A},{cooldowns B}] }] }
```

Roughly 1.5–2.5 KB, 10 times a second. Clients interpolate positions between snapshots and
predict their own movement locally (same collision code, same map), snapping only if they drift
more than 48 px from the host's view.

## 3. Behaviour notes

- Every human is active at once online. There is no hotseat shot clock.
- Fights do not pause the island. A fighter is frozen and cannot be engaged by a third party; the
  Ashfall does not burn fighters until the fight ends.
- A player who dies keeps receiving snapshots and spectates until the round ends.
- **Host migration.** Every snapshot carries enough state to take over (positions, HP, energy,
  weapons, medkits, timers, AI aggression, every fight's phase/dice/log/statuses/cooldowns). When
  the server announces a new host (`{"t":"host"}`), that client promotes its mirrored state to the
  authoritative one and keeps simulating from the last snapshot; other clients just keep sending
  to `"host"`. At most 100 ms of play is lost. If no `host` message arrives within 6 s of the host's
  `peer off`, clients give up and return to the menu.
- **Dropped players.** A disconnected player's survivor is converted to an AI bot (name suffixed
  "(bot)") so the round stays whole; the same happens to the old host's survivor after migration.
  Reconnecting to reclaim a bot is not implemented yet.
- Dice are rolled on the host only. Clients never decide an outcome.

## 4. Deploying

- Serve `index.html` from any static host (HTTPS) and run the relay behind `wss://`. The lobby
  remembers the last server address, room and name in `localStorage`.
- The reference relay logs joins/leaves and answers `GET /` with a room count for health checks.
