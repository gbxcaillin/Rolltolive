# Ashfall — hosted build

**Generated repository. Do not edit here.** Every file is synced from
[gbxcaillin/Rolltolive](https://github.com/gbxcaillin/Rolltolive) (the offline/test source of truth)
by `tools/sync-hosted.sh` and the `sync-hosted` GitHub Action. Edits made here are overwritten.

One Node process, no dependencies: serves the game from `public/` and runs the WebSocket room relay
on the same port. The game connects back to its own origin, so no server address needs typing.

```
npm start                      # http://localhost:8787  (PORT / PUBLIC_DIR env overrides)
curl localhost:8787/health     # {"ok":true,"rooms":0,"players":0}
```

Deploy: `Dockerfile`, `render.yaml` and `fly.toml` are included. Any host that runs
`node server/relay.js` behind HTTPS/WSS works. Art goes in `public/art/` (see `public/art/README.md`).

Protocol for a custom server: `NETWORK.md`.
