# Art pipeline

The game draws everything with canvas primitives, so it runs with no art at all. Every draw path
also checks for a sprite first. Drop PNGs into this folder, flip the asset's `status` to `"ready"`, serve the game over HTTP
(`npx serve .` or any static host), and each asset replaces its primitive the moment it loads.
Opened from `file://` the browser blocks fetches, so the primitives are used. That is by design.

## Files

| File | What it lists |
|---|---|
| `manifest.json` | Engine conventions (tile size, anchors, palette, style) and the pack list. |
| `tiles.json` | 8 ground tiles with variant counts. |
| `characters.json` | 6 classes × 5 animations + 6 portraits. |
| `weapons-items.json` | 20 weapons (held sprite + icon each), crate, medkit, barge, skull. |
| `ui-fx.json` | d20 sheet, combat backdrop, logo, 19 ability icons. |

## Asset entry

```json
{ "id": "char.warden.walk", "file": "characters/warden_walk.png", "status": "needed",
  "kind": "sheet", "frameW": 48, "frameH": 64, "frames": 6, "fps": 8, "anchor": [0.5, 1], "hand": [11, -18],
  "description": "what the artist should draw" }
```

- `id` is the engine key. Do not rename it. The engine looks up exactly these ids.
- `file` is relative to this folder. The engine loads an asset only when `status` is `"ready"`; leave `"needed"` (or anything else) until the PNG is delivered, so nothing 404s.
- `kind`: `image` (one frame) or `sheet` (frames left to right, wrapping rows).
- `anchor`: fraction of the frame that sits on the draw point. `[0.5, 1]` is the feet.
- `hand`: character sheets only. Offset (logical px, facing right) where the held weapon sprite is drawn.
- Sprites face right. The engine mirrors them when a character faces left.
- Deliver at 1× logical pixels with alpha. Pixel art or clean vector, but 2 px dark outlines and the
  palette in `manifest.json` keep everything consistent with the primitive fallbacks.

## Engine keys

| Key pattern | Where it is drawn |
|---|---|
| `tile.<deep,water,sand,grass,forest,rock,ruin,ash>` | Map pre-render; variant picked by tile hash |
| `char.<classId>.<idle,walk,attack,hit,death>` | Overworld (scale 1) and combat scene (scale 2–4) |
| `weapon.<type>.<tier>` | At the character's hand |
| `icon.<abilityId>` | Combat action buttons |
| `icon.weapon.<type>.<tier>`, `item.medkit` | Reserved for HUD inventory (v2) |
| `portrait.<classId>` | Class select and lobby cards |
| `item.crate`, `item.barge`, `fx.skull` | Overworld props |
| `dice.d20` | The roll; frames 0–19 faces, 20+ tumble |
| `bg.combat` | Encounter backdrop |
| `ui.title.portrait`, `ui.title.landscape` | Title screen key art, chosen by orientation, drawn with object-fit cover; `startButton` marks the painted START plate |
| `ui.logo` | Reserved (v2) |

Class ids: `warden`, `techno`, `bruiser`, `hexblade`, `alch`, `wraith`.
Weapon types: `blade`, `blunt`, `ranged`, `arcane`, `tech`. Tiers 1–4.
