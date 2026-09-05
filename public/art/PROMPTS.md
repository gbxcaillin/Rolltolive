# Ashfall — artwork generation prompts

Copy-paste prompts for an image generator (Midjourney, DALL·E, Stable Diffusion, Flux, etc.).
Every prompt ends with the shared STYLE block so the whole set reads as one game. File names,
sizes, frame counts and anchors must match `art/*.json`; the generator will not hit exact pixel
sizes, so generate large, then downscale and lay out sheets by hand (notes at the bottom).

---

## STYLE (append to every prompt)

```
Style: bold flat-shaded 2D game sprite, thick dark outlines (#0a0e1a), saturated accent colours, slight rust and grime, post-apocalyptic science-and-magic wasteland, readable at small size, clean silhouette, no text, no watermark, no background (transparent PNG), centered, facing right.
Palette: ink #0a0e1a, pink #ff3e7f, cyan #2ee6ff, gold #ffd166, green #5cff9d, red #ff4d4d, purple #b56cff, orange #ff8c42, bone-white #f5f2ec.
```

For tiles and backgrounds replace "no background" with "seamless, top-down".

---

## 1. Characters (6 classes × 5 animations + portrait)

Generate the **base design** first for each class, then reuse it as an image reference for every
animation sheet so the frames stay consistent.

### Base designs

```
WARDEN — a lean wasteland ranger, hooded green cloak, practical layered clothes, quiver and scrap bow on the back, calm watchful eyes, accent colour green #7bd88f. Full body, neutral idle pose. + STYLE
```
```
TECHNOMANCER — a reactor witch: brass goggles pushed up, cables running down one arm into a glowing cyan tech gauntlet, patched lab coat over light armour, accent colour cyan #2ee6ff. Full body, neutral idle pose. + STYLE
```
```
BRUISER — a scrapyard titan: massive frame, welded iron helmet with a single orange visor slit, shoulder plates of rusted car panels, rebar wrapped around one fist, accent colour orange #ff8c42. Full body, neutral idle pose. + STYLE
```
```
HEXBLADE — a cursed duelist: horned mask, purple rune tattoos glowing on the forearms, tattered black cloak, runed machete at the hip, accent colour purple #b56cff. Full body, neutral idle pose. + STYLE
```
```
ALCHEMIST — a field medic: gas mask with round gold lenses, satchel of glowing vials across the chest, yellow chemical stains on a canvas coat, accent colour gold #ffd166. Full body, neutral idle pose. + STYLE
```
```
WRAITH — an ash scavenger: dark hood, pink scarf-mask over the lower face, wiry fast build, bandolier of knives and a revolver, accent colour pink #ff3e7f. Full body, neutral idle pose. + STYLE
```

### Animation sheets (run once per class, swap the class name)

```
Sprite sheet of the WARDEN (use the attached base design), 4 frames in a horizontal row, IDLE animation: subtle breathing loop, weight shifts, cloak sways. Same size and position in every frame. Facing right. + STYLE
```
```
Sprite sheet of the WARDEN (use the attached base design), 6 frames in a horizontal row, WALK cycle: full run stride, arms pumping, cloak trailing. Same size and position in every frame. Facing right. + STYLE
```
```
Sprite sheet of the WARDEN (use the attached base design), 4 frames in a horizontal row, ATTACK: wind-up, strike/shoot forward, follow-through, return to idle. Right hand free to hold a weapon. Facing right. + STYLE
```
```
Sprite sheet of the WARDEN (use the attached base design), 2 frames in a horizontal row, HIT reaction: flinch back, brief white flash on frame 2. Facing right. + STYLE
```
```
Sprite sheet of the WARDEN (use the attached base design), 6 frames in a horizontal row, DEATH: stagger, fall to knees, collapse, final frame lying still. Facing right. + STYLE
```

Deliver each sheet as `characters/<classId>_<anim>.png`, frames 48×64 px each, feet at the
bottom-centre of every frame, empty right hand at about (11, −18) px from the feet.
Class ids: `warden`, `techno`, `bruiser`, `hexblade`, `alch`, `wraith`.

### Portraits

```
Portrait bust of the WARDEN (use the attached base design), head and shoulders, three-quarter view, dramatic dusk rim light in the class accent colour, dark vignette. 96×96 square composition. + STYLE (keep a background this time: dark smoky gradient)
```

---

## 2. Tiles (8, top-down, 32×32, seamless)

Generate a 4×1 strip of variants where the JSON says `frames: 4`, else 3×1.

```
Top-down seamless ground tile, DEEP OCEAN WATER, dark navy #08213f, almost flat with a faint slow swell, 4 subtle variants in a row. + STYLE
```
```
Top-down seamless ground tile, SHALLOW WATER, blue #12457a with small light wave highlights, 4 subtle variants in a row. + STYLE
```
```
Top-down seamless ground tile, BEACH SAND, warm ochre #e6c47a with sparse pebbles and shell flecks, 4 subtle variants in a row. + STYLE
```
```
Top-down seamless ground tile, GRASS, two green tones around #6ab04c with small tufts, 4 subtle variants in a row. + STYLE
```
```
Top-down seamless ground tile, FOREST CANOPY, dense dark-green tree tops #2f6a3a with lighter highlights and drop shadows, 4 subtle variants in a row. + STYLE
```
```
Top-down seamless ground tile, ROCK CLIFF, solid grey-blue faceted boulders #5b5f73 with bright edge highlights, reads as impassable, 3 variants in a row. + STYLE
```
```
Top-down seamless ground tile, RUINED BUILDING BLOCK, dark slate walls #2a2d3b, rust-orange lit windows, cracked concrete top, reads as impassable, 3 variants in a row. + STYLE
```
```
Top-down seamless ground tile, ASHFALL GROUND, dark grey ash #3a3540 with a few dying orange embers, 3 variants in a row. + STYLE
```

Deliver as `tiles/<name>.png`, each variant 32×32, strip laid out left to right.

---

## 3. Weapons (5 types × 4 tiers = 20, held sprite + icon)

Template, one line per weapon. The held sprite points right with the grip at the left-centre.

```
Game weapon sprite, <NAME>, a <DESCRIPTION>, pointing right, grip at left, tier <T> of 4 (<T>=1 crude scrap, 2 well-made, 3 glowing high-tech, 4 legendary with strong glow), glow colour <GLOW>. 32×32 composition. + STYLE
```

| id | NAME | DESCRIPTION | GLOW |
|---|---|---|---|
| blade.1 | Shiv | sharpened scrap-metal knife with tape grip | none |
| blade.2 | Rune Machete | heavy machete etched with faint runes | faint white |
| blade.3 | Plasma Katana | slim katana with a white-hot plasma edge | white |
| blade.4 | Voidreaver | black blade leaking violet void energy | white-violet |
| blunt.1 | Lead Pipe | dented lead pipe | none |
| blunt.2 | Rebar Maul | concrete chunk on rebar, a crude maul | none |
| blunt.3 | Gravity Hammer | sledgehammer with a humming tan energy core | tan #c8a57a |
| blunt.4 | Titan Fist | giant piston-driven gauntlet | tan |
| ranged.1 | Rusty Revolver | rusted six-shot revolver | none |
| ranged.2 | Scrap Bow | compound bow built from car springs | none |
| ranged.3 | Railgun | long coil railgun with blue-grey charge lights | grey-blue #9aa7bd |
| ranged.4 | Storm Rifle | sleek rifle wrapped in crackling lightning | grey-blue |
| arcane.1 | Bone Wand | wand carved from a femur | none |
| arcane.2 | Ember Staff | gnarled staff with a smouldering ember tip | faint purple |
| arcane.3 | Frost Scepter | crystal scepter with icy purple light | purple #b56cff |
| arcane.4 | Eclipse Focus | floating black sun orb ringed with purple fire | purple |
| tech.1 | Shock Prod | cattle prod with exposed sparking wires | none |
| tech.2 | Tesla Gauntlet | forearm gauntlet with tesla coils | faint cyan |
| tech.3 | Nano Blaster | compact blaster with a glowing cyan core | cyan #2ee6ff |
| tech.4 | Singularity Cannon | shoulder cannon with a tiny black hole in the barrel | cyan |

Deliver held sprites as `weapons/<type>_<tier>.png` (32×32, grip at 20 % from the left, 60 %
down) and icons as `icons/weapon_<type>_<tier>.png` (32×32, centred).

Icon variant of the template:
```
Game inventory icon, <NAME>, <DESCRIPTION>, centred, slight 3/4 angle, glow colour <GLOW>, 32×32 composition. + STYLE
```

---

## 4. Items and props

```
Top-down game prop, SUPPLY CRATE: rusted metal box with gold straps and a faint gold glow, 32×28 composition. + STYLE
```
```
Game icon, MEDKIT: canvas pouch with a bone-white cross, green stitching, 24×24 composition. + STYLE
```
```
Sprite sheet, 4 frames in a row, EXTRACTION BARGE beached on sand seen from above-front: flat rusted hull, small gold cabin, cyan running lights, a rotating beacon that pulses across the 4 frames, 96×56 per frame. + STYLE
```
```
Small game marker, SKULL: bone-white skull half-sunk in ash, 20×20 composition. + STYLE
```

---

## 5. UI and effects

```
Sprite sheet, 28 frames in rows of 7, a GOLD ICOSAHEDRAL D20 DIE: frames 1–20 show the die settled with faces 1 to 20 clearly readable in dark numerals, frames 21–28 show it tumbling mid-air with motion blur. Gold #ffd166 with dark facet lines, 96×96 per frame. + STYLE
```
```
Wide game backdrop 1280×720, ENCOUNTER SCENE: ruined shoreline at dusk under falling ash, broken concrete pier, distant reactor towers, pink ashfall ring glowing on the horizon, dark uncluttered centre so two characters read clearly in front of it. Painterly but flat-shaded, dark vignette. + STYLE (keep background)
```
```
Game logo wordmark, "ASHFALL", heavy geometric uppercase letters, wide tracking, gradient gold #ffd166 → pink #ff3e7f → cyan #2ee6ff, embers drifting off the letters, hard dark drop shadow, 800×240, transparent background.
```

### Ability icons (19, 32×32, one line each)

Template: `Game ability icon, <SUBJECT>, single bold symbol, <COLOUR> on dark, 32×32 composition. + STYLE`

| file | SUBJECT | COLOUR |
|---|---|---|
| ability_attack | clenched fist striking | bone-white |
| ability_flee | running figure with motion lines | orange |
| ability_medkit | pouch with a cross | green |
| ability_snare | bear-trap jaws | green |
| ability_arc | forked lightning bolt | cyan |
| ability_slam | fist hitting cracked ground | orange |
| ability_leech | dripping purple heart with fangs | purple |
| ability_stim | syringe with a spark | gold |
| ability_venom | dagger dripping green poison | pink |
| ability_cleave | sweeping blade arc | white |
| ability_flurry | two crossed blades with speed lines | white |
| ability_crush | hammer coming down with impact stars | tan |
| ability_stagger | spinning stars over a helmet | tan |
| ability_aimed | crosshair over an arrow | grey-blue |
| ability_volley | three arrows fanning out | grey-blue |
| ability_ember | fireball comet | purple-orange |
| ability_hex | skull inside a rune circle | purple |
| ability_overclock | gear with a lightning spark | cyan |
| ability_drones | three small hovering drones | cyan |

Deliver as `icons/<file>.png`.

---

## Post-processing checklist

1. Generate at 4–8× the target size, remove the background, then downscale with nearest-neighbour
   (pixel look) or Lanczos (clean vector look). Keep one method for the whole set.
2. Lay frames out left to right in a single row (rows of 7 for the d20) at exactly the
   `frameW × frameH` in the JSON. Feet on the bottom edge, centred, for characters.
3. Sprites face right; the engine mirrors them.
4. Save to the `file` path in the JSON and flip that asset's `"status"` to `"ready"`; anything
   else is skipped by the loader.
5. Serve the folder over HTTP and open the game: each asset replaces its primitive as it loads.
