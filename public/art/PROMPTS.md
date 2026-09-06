# Outborn — artwork generation prompts (matched to the shipped key art)

Copy-paste prompts for an image generator (Midjourney, Flux, Stable Diffusion, DALL·E, OpenArt…).
They are written to match the artwork already in the game: the Outborn title paintings and the six
class portraits. Every prompt ends with the shared STYLE block so the whole set reads as one game.

The generator will not hit exact pixel sizes. Generate large, then downscale and lay out sheets by
hand (checklist at the bottom). File names, sizes, frame counts and anchors must match `art/*.json`.

---

## STYLE (append to every prompt)

```
Style: highly detailed dark-fantasy post-apocalyptic illustration, heavy black ink linework with painterly colour, rusted riveted iron, torn layered cloth and leather straps, chipped paint, ash and grime, glowing rune and reactor accents, dramatic rim light, rich saturated colour against deep shadow, cinematic contrast. Same artist as the Outborn key art (attach a class portrait or the title painting as a style reference). No text, no watermark, no signature.
Palette: ink #0a0e1a, pink #ff3e7f, cyan #2ee6ff, gold #ffd166, green #5cff9d, red #ff4d4d, purple #b56cff, orange #ff8c42, bone-white #f5f2ec, rust #8a4a1f.
```

Two backgrounds are used, pick per section:

- `BLACK BG` — "isolated on a solid pure black background (#000000), nothing touching the edges, no
  ground shadow". The engine keys pure black out at runtime (this is how the portraits work), so keep
  the backdrop truly black and the figure clear of the image edges.
- `SEAMLESS` — "seamless tileable texture, straight top-down view, even lighting, no vignette".

---

## 1. Characters — animation sheets (6 classes × 5 sheets)

The portraits already define each character. Attach the class's portrait (`art/portraits/<id>.jpg`)
as the image reference for every sheet so the frames stay consistent. Frames are 48×64 in the game;
generate each frame at 512×683 or larger and downscale. All sheets: `BLACK BG`, facing right.

Character reminders (match the portraits exactly):

```
WARDEN — hooded green cloak with pale rune stitching, scrap bow and green-fletched arrows on the back, leather belts and a glowing green lantern vial, calm sharp-eyed ranger.
TECHNOMANCER — white hair tied up, brass goggles, white lab coat over dark armour, one arm a cyan-lit brass-and-cable reactor gauntlet, glowing vials at the belt.
BRUISER — huge, welded iron helmet with an orange visor slit, rusted plate shoulders and gauntlets wrapped in chain and rope, orange rags, exposed muscle.
HEXBLADE — horned bone mask with a violet glowing eye, tattered black-and-purple cloak, purple rune tattoos on the forearms, curved rune-lit machete, skull charms.
ALCHEMIST — canvas coat stained gold and white, gas mask with round gold lenses, chest satchel of glowing yellow vials, a swinging alchemical lantern.
WRAITH — dark hood and crimson scarf-mask, ragged pink-red cape, throwing knives on the chest, revolver at the hip, wiry and fast.
```

Run these once per class, swapping the class name:

```
Sprite sheet of the WARDEN from the attached portrait, 4 frames in a single horizontal row, IDLE loop: breathing, weight shifting foot to foot, cloak swaying. Identical scale and foot position in every frame, evenly spaced. Facing right. BLACK BG + STYLE
```
```
Sprite sheet of the WARDEN from the attached portrait, 6 frames in a single horizontal row, RUN cycle: full stride, arms pumping, cloak trailing behind, contact-down-passing-up poses. Identical scale and foot position in every frame, evenly spaced. Facing right. BLACK BG + STYLE
```
```
Sprite sheet of the WARDEN from the attached portrait, 4 frames in a single horizontal row, ATTACK: wind-up, strike forward with the right hand, follow-through, recover. Right hand empty (weapons are drawn separately). Identical scale and foot position. Facing right. BLACK BG + STYLE
```
```
Sprite sheet of the WARDEN from the attached portrait, 2 frames in a single horizontal row, HIT reaction: flinch back and clutch the wound, then stagger. Identical scale and foot position. Facing right. BLACK BG + STYLE
```
```
Sprite sheet of the WARDEN from the attached portrait, 6 frames in a single horizontal row, DEATH: stagger, drop to one knee, collapse forward, lie still, ash drifting off the body in the last two frames. Facing right. BLACK BG + STYLE
```

## 2. Tiles (8, top-down, 32×32, seamless)

Generate at 512×512, downscale to 32×32 sets of 3–4 variants. The ground should read as painted
terrain, not photo texture; keep detail large enough to survive the downscale.

```
Seamless top-down deep ocean water, near-black teal, long slow swells, faint moonlit ash flecks on the surface, 4 variants. SEAMLESS + STYLE
```
```
Seamless top-down shallow coastal water, teal-blue, rippling, rust-orange silt patches and drowned wreckage shadows below the surface, 4 variants. SEAMLESS + STYLE
```
```
Seamless top-down black volcanic sand beach with pale bone-coloured shell fragments, drift ash, sparse wet stones, 4 variants. SEAMLESS + STYLE
```
```
Seamless top-down wasteland grass, dull olive-green tufts with yellow dead patches and rune-scorched bare earth, 4 variants. SEAMLESS + STYLE
```
```
Seamless top-down dead forest canopy, dense dark green and rust-brown crowns, gnarled bare branches, pale fungal glow between trunks, 4 variants. SEAMLESS + STYLE
```
```
Seamless top-down cracked grey rock and scree, iron-stained fissures, patches of soot, 3 variants. SEAMLESS + STYLE
```
```
Seamless top-down ruined city block: broken concrete slabs, exposed rebar, collapsed walls, faint orange window glow from below, rune graffiti, 3 variants. SEAMLESS + STYLE
```
```
Seamless top-down ash field, grey-violet drifts, smouldering embers, half-buried skulls and rusted debris, 3 variants. SEAMLESS + STYLE
```

## 3. Weapons (5 types × 4 tiers = 20 held sprites, 20 icons)

Held sprites are drawn in the character's right hand at 32×32 (scale up in combat), so they must
read at small size: one strong silhouette, one glowing accent. Generate at 512×512, `BLACK BG`,
pointing to the upper right. Icons are the same object, straight on, centred, with a subtle
dark-red vignette behind for the button.

```
BLADE T1 — Shiv: a sharpened rebar spike wrapped in bloody rag, rust scale, no glow. BLACK BG + STYLE
BLADE T2 — Rune Machete: a wide chipped machete with a single purple rune burning along the spine. BLACK BG + STYLE
BLADE T3 — Plasma Katana: a long blade with a cyan plasma edge, brass coolant lines in the hilt. BLACK BG + STYLE
BLADE T4 — Voidreaver: a black curved greatsword with a violet void tear running its length, bone hilt. BLACK BG + STYLE
```
```
BLUNT T1 — Lead Pipe: a bent lead pipe with a rusted valve wheel at the end. BLACK BG + STYLE
BLUNT T2 — Rebar Maul: a concrete block on a rebar haft, bristling with bent rods. BLACK BG + STYLE
BLUNT T3 — Gravity Hammer: an iron sledge with an orange energy core in the head, chains hanging. BLACK BG + STYLE
BLUNT T4 — Titan Fist: a colossal engine-block gauntlet, glowing orange between the plates. BLACK BG + STYLE
```
```
RANGED T1 — Rusty Revolver: a heavy revolver, taped grip, pitted barrel. BLACK BG + STYLE
RANGED T2 — Scrap Bow: a compound bow of car springs and cable, green-fletched arrow nocked. BLACK BG + STYLE
RANGED T3 — Railgun: a long coil rifle with cyan magnetic rings and copper wiring. BLACK BG + STYLE
RANGED T4 — Storm Rifle: a bulky rifle crackling with gold lightning, brass storm capacitor. BLACK BG + STYLE
```
```
ARCANE T1 — Bone Wand: a carved femur wand, faint violet tip. BLACK BG + STYLE
ARCANE T2 — Ember Staff: a charred staff with a caged burning ember. BLACK BG + STYLE
ARCANE T3 — Frost Scepter: an iron scepter with a cyan crystal and frost creeping down the shaft. BLACK BG + STYLE
ARCANE T4 — Eclipse Focus: a floating ring of black metal around a purple-white eclipse. BLACK BG + STYLE
```
```
TECH T1 — Shock Baton: a police baton with exposed sparking wires. BLACK BG + STYLE
TECH T2 — Arc Welder: a handheld welder torch with a cyan arc. BLACK BG + STYLE
TECH T3 — Drone Rig: a wrist launcher with three hovering cyan drones. BLACK BG + STYLE
TECH T4 — Reactor Gauntlet: a brass gauntlet with a glowing cyan reactor core, tubes and gauges. BLACK BG + STYLE
```

Icon variant, append to any weapon line: `…, straight-on centred icon, subtle dark-red vignette, reads at 32 px.`

## 4. Items and props

```
Supply crate: a rust-red steel ammo crate with a glowing gold latch and stencilled rune, slightly open, three-quarter top-down view. BLACK BG + STYLE
```
```
Medkit: a battered olive field-medic tin with a bone-white cross and a glowing green vial clipped to the side, three-quarter view. BLACK BG + STYLE
```
```
Escape barge, 4-frame sheet in a horizontal row: a rusted flat-bottomed river barge with a smoking stack and a gold signal lamp, gently bobbing and rocking across the frames, three-quarter top-down view. BLACK BG + STYLE
```
```
Death marker: a small skull sunk in ash with a faint pink ember in one eye, three-quarter top-down view. BLACK BG + STYLE
```

## 5. UI and effects

```
Combat backdrop, 16:9: the Ashfield wastes at dusk — cracked black-sand ground in the foreground, ruined observatory silhouette on a ridge, the violet Ashfall storm ring closing on the horizon, embers drifting, empty centre stage with room for two figures, muted so characters pop. STYLE
```
```
Twenty-sided die sprite sheet: an obsidian-and-gold d20 with rune-carved faces, 28 frames in a 7×4 grid — frames 1–20 show faces 1 to 20 settled and readable, frames 21–28 are motion-blurred tumbling angles. Numbers bold bone-white, face 20 glowing gold, face 1 glowing red. BLACK BG + STYLE
```
```
Wordmark: "OUTBORN" in riveted, rust-bitten iron capitals with spiked edges, a torn red banner beneath reading "ROLL TO LIVE", matching the title painting exactly, wide banner composition. BLACK BG + STYLE
```
```
Power die set, three icons: a cyan-edged obsidian d6 (cube), a purple-edged d12 (pentagonal faces), a gold-edged d20 — same material as the d20 sheet, straight on. BLACK BG + STYLE
```

### Ability icons (19, 32×32, one line each)

All: `…, bold single-object icon on a dark-red vignette, one glowing accent, reads at 32 px. BLACK BG + STYLE`

```
Attack — a clenched rust-gauntlet fist.
Flee — a torn boot mid-sprint with ash trailing.
Medkit — the field-medic tin from the items set, green vial lit.
Snare Trap — a coiled steel snare with a green rune trigger.
Arc Bolt — a forked cyan lightning bolt from a brass coil.
Ground Slam — a cracked ground shockwave under an orange fist.
Soul Leech — a purple wisp being drawn into a horned mask.
Stim Shot — a gold syringe with a glowing plunger.
Venom Strike — a curved knife dripping pink-green venom.
Cleave — a wide diagonal blade slash with sparks.
Flurry — three overlapping slash arcs.
Crushing Blow — a hammer head striking, orange impact.
Stagger — a spiral of stars over a cracked helmet.
Aimed Shot — a crosshair over a single rifle round.
Volley — three arrows fanning upward.
Ember Bolt — a flaming ember comet.
Hex of Rot — a rotting purple rune eye.
Overclock — a brass gauge redlining, cyan sparks.
Drone Swarm — three cyan drones in a triangle.
```

### Defensive moves (6, same icon rule)

```
Kite — a green boot print with a trailing dashed arc.
Shield Drone — a cyan hex shield projected by a small drone.
Guard — a raised rusted plate gauntlet.
Mirror Curse — a cracked violet mirror reflecting a blade.
Purge — a gold flask pouring cleansing light.
Dirty Trick — a hand throwing a burst of sand.
```

---

## Post-processing checklist

1. Keying: portraits and sprites must sit on pure black (#000000). The engine flood-fills the black from
   the border, so black *inside* a figure is safe; a grey or noisy backdrop is not.
2. Sheets: equal-width frames in one row (or the 7×4 grid for the d20), frame width × count = sheet
   width. Set `frames`, `frameW`, `frameH` in the JSON to what you actually laid out.
3. Anchor: feet at the bottom-centre for characters ([0.5, 1]); centred for icons and tiles.
4. Downscale with a high-quality filter (Lanczos) and sharpen lightly; check every sprite at 1× and 2×.
5. Save JPEG quality ~80 for large paintings, PNG for anything with transparency, and keep totals
   inside the budgets in `art/README.md`. Set `"status": "ready"` in the JSON to switch an asset on.
