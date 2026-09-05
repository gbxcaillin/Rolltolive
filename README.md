# Roll to Live

A browser and mobile survival game. Ten contestants are dropped on a post-apocalyptic island of
science and magic. Walk the island, loot crates, and when you meet another survivor, fight it out
D&D style: pick an ability, roll a d20, live with the result. Last one standing reaches the
extraction barge to the Safe City.

## Play

Open `index.html` in any modern browser. No build, no server, no assets: one file, works offline
from a double-click, on desktop or phone.

- **Solo**: you against 9 AI survivors.
- **Hotseat 2P–4P**: pass one device around; AI fill the round to 10. Humans can fight each other.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / arrows | left-side joystick |
| Engage | E / Space | ENGAGE button |
| Choose ability | 1–6 | tap |
| Roll d20 | Space / Enter | tap the dice |
| Pause / Mute | P / M | top-right buttons |

## Design

See [DESIGN.md](DESIGN.md) for the wireframe: core loop, win/lose rules, the six classes and their
abilities, weapon tiers, dice rules, AI behaviour, and the roadmap. Tunable constants (speeds, zone
timing, damage, scores) are at the top of the script in `index.html`.
