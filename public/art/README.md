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
| `portrait.<classId>` | Class picker (select + lobby) and the combat scene: 768×1152 JPEG at `portraits/<classId>.jpg`, 2:3, character on solid black. In combat the black is keyed out (flood fill from the border, `PORTRAIT_KEY_LEVEL`) and the cutout is drawn on the encounter backdrop, mirrored for the right-hand fighter, with a white silhouette for hit flashes. Keep the backdrop pure black and the figure clear of the edges. The same cutout walks the overworld with procedural motion (bounce, rock, lean, breathing) until `char.<classId>.*` frame sheets exist. A drawn figure stands in when the file is missing or the game runs from file:// |
| `item.crate`, `item.barge`, `fx.skull` | Overworld props |
| `dice.d20` | The roll; frames 0–19 faces, 20+ tumble |
| `bg.combat` | Encounter backdrop |
| `ui.intro.portrait`, `ui.intro.landscape` | Intro video (mp4, H.264 main profile + AAC, ~15 s, about 2 MB each, `+faststart` so it plays while downloading) played once after START: the portrait cut on tall screens, the landscape cut on wide ones, letterboxed to fit; tap or any key skips; a missing file or unsupported codec goes straight to the menu. Preloaded while the title shows. |
| `ui.title.portrait`, `ui.title.landscape` | Title screen key art, chosen by orientation, drawn with object-fit cover; `startButton` marks the painted START plate |
| `ui.logo` | Reserved (v2) |

Class ids: `warden`, `techno`, `bruiser`, `hexblade`, `alch`, `wraith`.
Weapon types: `blade`, `blunt`, `ranged`, `arcane`, `tech`. Tiers 1–4.

## Keeping the first load fast

Everything a first-time visitor downloads is under `art/`; the page itself is one file. The loader is staged for
slow links: the title painting for the current orientation loads alone, then the intro video starts buffering, and
the rest (portraits, the other painting) begins once the video can play through, six seconds later, or as soon as
the menu opens, whichever comes first. Keep new assets inside those budgets:

- Videos: re-encode to roughly 1 Mbps. The intro cuts were produced with
  `ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 27 -profile:v main -level 4.0 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 80k out.mp4`
  (16 MB → 2 MB with no visible loss).
- JPEGs: quality 80 or so (`ffmpeg -i in.jpg -q:v 5 out.jpg`); the paintings are ~380 KB, portraits ~90–150 KB.

