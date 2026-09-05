# Ashfall — hosted build branch

**Generated branch. Do not edit here.** Everything on this branch is built from the source branch
(`main` → `hosted`, `feature/x` → `hosted/feature/x`) by `tools/sync-hosted.sh` and the `sync-hosted`
GitHub Action after the headless tests pass. Commits made here are overwritten by the next build.

One Node process, no dependencies: serves the game from `public/` and runs the WebSocket room relay
on the same port. The game connects back to its own origin, so players never type a server address.

```
npm start                      # http://localhost:8787  (PORT / PUBLIC_DIR env overrides)
curl localhost:8787/health     # {"ok":true,"rooms":0,"players":0}
```

Deploy: point Render / Fly / Railway / Docker at **this branch**. `Dockerfile`, `render.yaml` and
`fly.toml` are included; any host that runs `node server/relay.js` behind HTTPS/WSS works.
Art goes in `public/art/` on the source branch (see `public/art/README.md`).

Protocol for a custom server: `NETWORK.md`.
