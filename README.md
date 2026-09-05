# Ashfall (working title: formerly Roll to Live)

A browser and mobile survival game. Ten contestants are dropped on a post-apocalyptic island of
science and magic. Walk the island, loot crates, and when you meet another survivor, fight it out
D&D style: pick an ability, roll a d20, live with the result. Last one standing reaches the
extraction barge to the Safe City.

## Play

Open `index.html` in any modern browser. No build, no assets: one file, works offline from a
double-click, on desktop or phone.

- **Solo**: you against 9 AI survivors.
- **Online**: several devices in one round. Run `node server/relay.js` (no dependencies) and enter
  its `ws://` address in the lobby, or point the game at your own server (see `NETWORK.md`).
- **Hotseat 2P–4P**: pass one device around; AI fill the round to 10.

You land with your fists and one signature ability. Weapons unlock moves, and each class handles
each weapon type differently. Medkits are carried. Each class has a passive perk.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / arrows | left-side joystick |
| Engage | E / Space | ENGAGE |
| Medkit · class action | H · Q | MED · ACT |
| Choose ability | 1–6 | tap |
| Roll d20 | Space / Enter | tap the dice |
| Pause / Mute | P / M | top-right buttons |

## Docs

- `DESIGN.md`: core loop, win/lose rules, classes, affinities, weapons, dice rules, AI, title review, roadmap.
- `NETWORK.md`: the relay contract and game messages for wiring in your server.
- `art/`: JSON manifests describing every piece of artwork the engine can load, plus the pipeline notes.
- Tunable constants (speeds, zone timing, damage, scores, snapshot rate) sit at the top of the script in `index.html`.
