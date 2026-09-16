# Outborn (formerly Roll to Live / Ashfall)

A browser and mobile survival game. Ten Outborn are dropped on Ashfield, a post-apocalyptic island of
science and magic. Walk the island, loot crates, and when you meet another survivor, fight it out
D&D style: pick an ability, roll a d20, live with the result. Last one standing reaches the
extraction barge to the Safe City.

## Play

Open `index.html` in any modern browser. No build step: one file, works offline from a
double-click, on desktop or phone. The `art/` folder beside it is optional and adds the painted
title, class portraits and the intro video (tap or any key skips it).

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

## Branches: source vs. hosted build

| Branch | Role | Edit here? |
|---|---|---|
| `main` (and feature branches) | **Offline / test source of truth.** Single-file game, relay, art specs, tests, docs. | Yes |
| `hosted-main` (and `hosted-<feature>`) | **Server-hosted build.** Only `public/` (game + art), `server/relay.js` and deploy configs (Dockerfile, Render, Fly). Deploy platforms point here. | No, generated |

They stay in step automatically: the `sync-hosted` GitHub Action runs the headless tests on every
push to a source branch, then rebuilds the matching build branch (`main` → `hosted-main`,
`feature/x` → `hosted-feature-x`) using the workflow's own token, so no secrets are needed.
Locally, `tools/sync-hosted.sh` does the same in one command.

## Install as an app

The game is a Progressive Web App. On the Pages site (or any https host) the browser offers to install it:

- **Android / Chrome, Edge, desktop Chrome**: an **Install app** button appears on the main menu when the
  browser allows it; otherwise use the browser menu → "Install app" / "Add to Home screen".
- **iPhone / iPad (Safari)**: Share → **Add to Home Screen**. It launches full-screen with the Outborn icon.

Installed, it runs offline: `sw.js` precaches the page, manifest and icons and caches the art on first use.
A new deploy is picked up on the next launch (the page is network-first); if you are mid-game when an
update arrives, a toast says so and it applies the next time you return to the menu. The service worker is
only registered over http(s), so double-clicking `index.html` still works as the plain offline test build.

For an app-store listing, wrap the Pages URL as a Trusted Web Activity (Android, e.g. with Bubblewrap) or a
Capacitor shell (iOS); the manifest, icons and offline cache are already in place for that.

## GitHub Pages

The `pages` workflow publishes `index.html` and `art/` from `main` to GitHub Pages. Enable it once
under Settings → Pages → Source: **GitHub Actions**. Solo and Hotseat play there directly. Pages
cannot run the WebSocket relay, so for Online either deploy `hosted-main` somewhere (Render, Fly,
your own server) and set the repository variable `RELAY_URL` to its `wss://` address, which the
workflow stamps into the page, or type the relay address in the lobby.

## Docs

- `DESIGN.md`: core loop, win/lose rules, classes, affinities, weapons, dice rules, AI, title review, roadmap.
- `NETWORK.md`: the relay contract and game messages for wiring in your server.
- `art/`: JSON manifests describing every piece of artwork the engine can load, plus the pipeline notes.
- Tunable constants (speeds, zone timing, damage, scores, snapshot rate) sit at the top of the script in `index.html`.
