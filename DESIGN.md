# OUTBORN — Design Wireframe

*Formerly "Roll to Live" and "Ashfall". The game is Outborn, the island is Ashfield, the storm ring is the Ashfall. See §13.*

A browser/mobile survival game. Ten contestants are dropped on a post-apocalyptic island of
science and magic. The last one standing earns a seat on the extraction barge to the Safe City,
for themselves and the family they fight for.

`index.html` is the complete, playable first version: one file, no dependencies, runs offline.
Online play needs the relay in `server/relay.js` (or your own server speaking `NETWORK.md`).

---

## 1. Core loop

```
 ┌─────────────┐   walk / loot / scout   ┌─────────────┐   choose ability   ┌──────────────┐
 │  OVERWORLD  │ ──────────────────────▶ │  ENCOUNTER  │ ─────────────────▶ │  ROLL d20    │
 │ (real-time) │ ◀────────────────────── │ (turn-based)│ ◀───────────────── │  resolve     │
 └─────────────┘   win / flee / die      └─────────────┘   next turn        └──────────────┘
        │
        ▼  the Ashfall (safe zone) shrinks every 100 s, faster as survivors fall and forces the survivors together
        ▼  last survivor → extraction barge appears → walk to it → ESCAPE
```

1. **Explore** the island in real time. Open supply crates for weapons, medkits, armor.
2. **Encounter** another contestant. Press ENGAGE (or get ambushed) to enter combat.
3. **Combat** is D&D style: pick an ability, roll a d20 against the target's Defense,
   natural 20 crits, natural 1 fumbles. Turns alternate until one side dies or flees.
4. **Survive** the shrinking Ashfall. Outside the ring you burn.
5. **Escape**: when you are the last one alive the extraction barge lands on a beach. Reach it.

## 2. Modes

| Mode | Humans | AI | Notes |
|---|---|---|---|
| Solo | 1 | 9 | Standard round. The island keeps running while you fight. |
| Online | 1–10 devices | fill to 10 | Host-authoritative over a WebSocket room relay (`NETWORK.md`). Everyone moves at once; fights run in parallel; the dead spectate. If the host drops, the next player is promoted and the round continues; a dropped player's survivor becomes a bot. |
| Hotseat 2P / 3P / 4P | 2–4 | fill to 10 | Local pass-and-play on one device. 20 s walking turns, then pass. Anyone attacked plays their own defense. The island pauses during a fight so the device can be handed over. |

## 3. Controls (shown on screen at load)

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / Arrow keys | Left-half virtual joystick |
| Engage nearby contestant | E or Space | ENGAGE button (bottom-right) |
| Use a medkit | H | MED button |
| Field action (one per class) | Q | ACT button |
| Pick ability in combat | 1–6 or click | Tap button |
| Roll the d20 | Space / Enter / click | Tap the ROLL button or the dice |
| Pause / controls | P or Esc | Tap ⏸ (top-right) |
| How to play (in-game guide) | H on the menu, or the button on the menu and pause screens | button |
| Mute | M | ♪ (top-right) |

### Ashfall clock and duel safety
The phase clock advances at `ZONE_SPEED_BASE_ALIVE / alive` speed (10 alive = 1×, 5 alive = 2×), capped at
`ZONE_SPEED_MAX` (2.5×) so the ring never closes faster than a survivor can cross to it. The HUD shows the
multiplier beside the countdown. The ring never kills a duelist: burn is frozen for anyone in combat and for
`COMBAT_BURN_GRACE` (5 s) after a fight ends, on top of the usual post-fight immunity. The HUD says "held back
by the duel" or "grace 4s — run!" while that applies.

## 4. Win / lose conditions

- **Win**: be the last contestant alive, then reach the extraction barge. Score bonus +1000.
- **Lose**: your HP reaches 0 (in combat, or burned by the Ashfall). Placement shown (#N of 10).
- **Hotseat**: the game ends when only one human remains alive and wins, or all humans are dead.
- **Score**: +2/s survival, +25 per crate, +1 per damage dealt, +200 × phase per kill, +1000 escape.
  Best score persists in `localStorage`. Restart rebuilds every object from scratch.

## 5. Contestant stats

| Stat | Meaning |
|---|---|
| HP | Hit points. 0 = dead. |
| DEF | Target number. An attack hits if `d20 + ATK + affinity + buffs ≥ DEF`. |
| ATK | To-hit modifier, also added to weapon damage. +1 per kill (max +4). |
| SPD | Initiative and flee rolls. |
| EN | Energy for abilities. +5 per combat turn. |

## 6. Progression: fists → weapon → moves

Everyone lands with **Attack** (a d6 plus ATK; Hexblade and Wraith fists add +1, Bruiser +2),
**one signature ability**, **one defensive move**, and **Flee**. That is the whole action bar at the start.

Weapons found in crates or taken from the dead add moves. Each weapon type carries two moves.
How many you can use, and how well the weapon works for you, depends on your class's **affinity**
with that type:

| Affinity | To hit | Damage | Moves unlocked |
|---|---|---|---|
| expert ★★ | +2 | +2 | both |
| skilled ★ | +1 | +1 | both |
| basic | 0 | 0 | first only |
| poor | −2 | −1 | none (plain Attack only) |

Pickup logic weighs tier and affinity together, so a Warden keeps a T2 bow over a T3 wand.
Medkits are inventory (2 carried, Alchemist 3): usable on the map (H) or as a combat action.

### Field actions and defensive moves

Every class has exactly one **field action** on Q (pays off on the map or in the next fight) and
one **defensive move** in the fight bar. Nothing else is shared; the action bar stays small.

| Class | Field action (Q) | Defensive move |
|---|---|---|
| Warden | Scout (15 EN, 30 s): every survivor on the minimap for 10 s, arrow to the nearest with its matchup | Kite (5 EN, CD 3): +4 DEF for 2 turns, recover 6 EN |
| Technomancer | Tinker (20 EN): +1 weapon tier, once per weapon | Shield Drone (8 EN, CD 4): absorbs the next 12 damage over 3 turns |
| Bruiser | Brace (15 EN): next fight starts with +4 DEF for 3 turns | Guard (4 EN, CD 2): +5 DEF and 2 more damage reduction for 2 turns |
| Hexblade | Blood Rite (10 HP): first attack next fight cannot miss and crits on 15+ | Mirror Curse (7 EN, CD 4): half of damage taken is reflected for 2 turns |
| Alchemist | Brew (15 EN, 40 s): make a medkit | Purge (6 EN, CD 3): cleanse poisons, hexes, cracks and stuns; heal 1d6+2 |
| Wraith | Shadow Sprint (12 EN, 15 s): 4 s at +70% speed, cannot be engaged | Dirty Trick (3 EN, CD 2): target −4 to hit, you +2, for 2 turns; only a natural 1 fails |

AI use them too: Technomancers tinker, Alchemists brew, Bruisers brace, Hexblades rite when
healthy and hunting, Wraiths sprint when hunting or racing the ring, and everyone reaches for
their defensive move under half health.

### The six classes

| Class | HP | DEF | ATK | SPD | EN | Fists | Signature | Passive perk | Expert / skilled with |
|---|---|---|---|---|---|---|---|---|---|
| **Warden** | 58 | 13 | +3 | 6 | 30 | d6 | Snare Trap: d12 + ATK, target loses next turn | Keen Eye: spots enemies 3× further on the minimap | ranged / blade |
| **Technomancer** | 50 | 12 | +2 | 5 | 45 | d6 | Arc Bolt: d12 + ATK, +2 hit | Field Tinker: Q upgrades your weapon one tier (20 EN, once per weapon) | tech / arcane |
| **Bruiser** | 80 | 15 | +2 | 3 | 25 | d6+2 | Ground Slam: d12 + ATK, target −3 DEF | Ironhide: every hit taken −2 damage | blunt / blade |
| **Hexblade** | 58 | 13 | +3 | 5 | 35 | d6+1 | Soul Leech: d12 + ATK, heal half | Blood Pact: kills heal 40 % | blade / arcane |
| **Alchemist** | 62 | 12 | +2 | 5 | 40 | d6 | Stim Shot: heal d12+6 | Field Medic: medkits heal double, +1 carried, 2× regen | arcane / ranged |
| **Wraith** | 52 | 14 | +4 | 8 | 35 | d6+1 | Venom Strike: d12 + ATK, then 3 poison/turn ×3 | Scavenger: +15 % speed, crate weapons +1 tier, crates on minimap | blade / ranged |

Poor fits: Warden–arcane, Technomancer–blade/blunt, Bruiser–ranged/arcane, Hexblade–ranged/tech,
Alchemist–blunt, Wraith–arcane. Everything else is basic.

## 7. Weapons and their moves

| Type | T1 (+1) | T2 (+2) | T3 (+4) | T4 (+6) | Move 1 (basic+) | Move 2 (skilled+) |
|---|---|---|---|---|---|---|
| Blade | Shiv | Rune Machete | Plasma Katana | Voidreaver | Cleave: d20 + weapon + ATK | Flurry: a d20 strike then a d6 strike |
| Blunt | Lead Pipe | Rebar Maul | Gravity Hammer | Titan Fist | Crushing Blow: d20 + weapon + ATK + 3, −2 hit | Stagger: d20 + weapon + ATK, target loses a turn |
| Ranged | Rusty Revolver | Scrap Bow | Railgun | Storm Rifle | Aimed Shot: d20 + weapon + ATK, +4 hit | Volley: a d20 strike then two d6 strikes, all at −2 |
| Arcane | Bone Wand | Ember Staff | Frost Scepter | Eclipse Focus | Ember Bolt: d20 + weapon + ATK, +2 hit | Hex of Rot: d20 sets −4 to −6 hit ×3 turns |
| Tech | Shock Prod | Tesla Gauntlet | Nano Blaster | Singularity Cannon | Overclock: +4 hit +4 dmg ×2 turns | Drone Swarm: 1d4 then 4/turn ×3 |

Crates: weapon 45 % (tier rises with the Ashfall phase), medkit 25 %, armor plate 12 % (+1 DEF,
max +3), power cell 8 %, supply cache 10 %.

### Class matchups (rock-paper-scissors)

The six classes sit on a circle. Each class **hunts** the next one, has the **edge** on the one
after, is **even** with the opposite class (and with its own), is **at risk** against the fourth and
**fears** the fifth. The bonus applies to hit *and* damage, both ways, so a hunt is a +6 swing.

| Relation | Bonus | Warden | Bruiser | Wraith | Technomancer | Hexblade | Alchemist |
|---|---|---|---|---|---|---|---|
| Hunts | +3 | Bruiser | Wraith | Technomancer | Hexblade | Alchemist | Warden |
| Edge on | +1 | Wraith | Technomancer | Hexblade | Alchemist | Warden | Bruiser |
| Even | 0 | Technomancer | Hexblade | Alchemist | Warden | Bruiser | Wraith |
| Risky vs | −1 | Hexblade | Alchemist | Warden | Bruiser | Wraith | Technomancer |
| Fears | −3 | Alchemist | Warden | Bruiser | Wraith | Technomancer | Hexblade |

Why: the Warden kites the slow Bruiser; Ironhide shrugs off the Wraith's knives; the Wraith
assassinates the squishy Technomancer; science disrupts the Hexblade's magic; curses rot the
Alchemist's chemistry; gas clouds beat the Warden's line of sight.

The game tells you before you commit: the ENGAGE prompt reads PREY / EDGE / EVEN / RISKY / AVOID
with the bonus, minimap dots are coloured the same way, and the class cards list who to chase and
who to run from. AI weigh matchups when choosing targets, so a Bruiser will chase a Wraith and
steer clear of a Warden.

### Duels and sanctuary (anti-vulture rules)

A fight is a **duel circle** (110 px). Anyone who is not part of it is pushed out and AI will not
path into it, so nobody can stand on top of a fight waiting for it to end. When it ends, the
survivor gets **sanctuary**: 8 s in which they cannot be engaged, shown as a green ring and a
countdown. If an enemy stays within 150 px, sanctuary keeps refreshing (to a cap of 14 s) so a
camper cannot time the exact instant it expires; the HUD names the circling enemy so the survivor
can walk away. Pressing Engage yourself ends your own sanctuary early: attacking is always a choice.

## 8. Dice rules

- Attack: roll d20. Natural 20 always hits and deals double damage. Natural 1 is a fumble
  (you hurt yourself for 3). Otherwise hit if `d20 + ATK + proficiency + buffs ≥ target DEF + buffs`.
- **Power dice** (the second die, shown under the d20 after the check): each move has a tier that
  decides the die it rolls for effect. `basic` = d6 (Attack), `special` = d12 (every class's
  signature and defensive move), `unlocked` = d20 (moves a weapon unlocks).
  Damage = power die + ATK + weapon tier bonus (+1/+2/+4/+6) + affinity + matchup, ×1.15
  (`DAMAGE_SCALE`), doubled on a crit, then armour. Multi-hit moves roll their power die once; the
  extra strikes are d6. Defensive and buff moves size their effect from the roll (shield = d12+6,
  Kite recovers d12 energy, Guard gives +4 to +6 DEF, Mirror reflects 30–75 %, Dirty Trick blinds
  for −3 to −5, Overclock +3 to +6, Hex −4 to −6).
- Heal / buff: natural 1 fails, natural 20 doubles the heal (or extends the buff by a turn).
- Debuff: must beat the target's DEF like an attack.
- Flee: `d20 + SPD ≥ 10 + enemy SPD`. Failure gives the enemy a free strike.
- Initiative: `d20 + SPD`. Status durations tick at the end of each full round.

## 9. AI

AI use the same progression: they pick up weapons by affinity, tinker as Technomancers, use
medkits under 50 % HP, and Wardens see 1.6× further.

### AI detail

- **Overworld**: each AI has an aggression value. Priorities: get inside the Ashfall → hunt a
  visible target it can beat (or anyone when aggressive / late phases) → loot the nearest crate →
  wander. AI-vs-AI fights resolve with the same rules off-screen and show up in the kill feed.
- **Combat**: heal under 40 % HP, buff early, debuff early, otherwise pick the attack with the
  highest expected damage (hit chance × average dice), flee when badly losing.
- **Difficulty ramp**: Ashfall damage grows per phase (3 → 25 HP/s), AI aggression and crate
  weapon tiers rise with phase, survivors gain ATK/HP per kill.

## 10. Screen wireframes

```
OVERWORLD                                   COMBAT
┌────────────────────────────────────────┐ ┌────────────────────────────────────────┐
│ YOU · Warden   7 ALIVE   PHASE 2 0:34  │ │  ROUND 3            Kestrel the Wraith │
│ HP ████████░░  SCORE 1240 BEST 4410    │ │  ▸ You hit for 11 (crit!)              │
│ EN ██████░░░░  Scrap Bow T2            │ │                                        │
│                                        │ │   [you]      ⬡ 17 ⬡        [enemy]    │
│        ~~~  🏝 island viewport  ~~~     │ │  HP ██████    d20        HP ███░░░    │
│            ▲ zone ring (pink)          │ │  EN ████                  EN ██        │
│      [E: ENGAGE] above nearby enemy    │ ├────────────────────────────────────────┤
│                              ┌──────┐  │ │ 1 Attack  2 Aimed  3 Snare  4 Focus   │
│ (joystick)        (ENGAGE)   │ mini │  │ │ 5 Volley  6 Flee            [ ROLL ]  │
└────────────────────────────────────────┘ └────────────────────────────────────────┘
```

CLASS PICKER (select screen and online lobby)
```
portrait phone                     landscape / tablet (≥760px wide)
┌──────────────────────┐           ┌────────────────────────────────────────────┐
│  CHOOSE YOUR SURVIVOR│           │ ┌────────┐  WARDEN  · Wasteland Ranger      │
│ ┌──────────────────┐ │           │ │        │  HP 58 DEF 13 ATK +3 SPD 6 EN 30 │
│ │ ‹   portrait   › │ │  1 / 6    │ │ ‹ art ›│  Snare Trap · Kite · Scout ·     │
│ │   (2:3, swipe)   │ │           │ │  2:3   │  Keen Eye · matchups · affinity  │
│ └──────────────────┘ │           │ │        │  [ CHOOSE WARDEN ]  1 of 6       │
│  WARDEN · stats      │           │ └────────┘  ○ ○ ● ○ ○ ○ (jump dots)         │
│  abilities, matchups │           └────────────────────────────────────────────┘
│  [ CHOOSE WARDEN ]   │
│  ○ ○ ● ○ ○ ○         │   ← → / swipe / tap art = next · Enter or Space = choose
└──────────────────────┘   1–6 still quick-pick · lobby: Space picks, Enter (host) starts
```
The art card uses `portrait.<classId>` from the art manifest; offline (file://) it falls back to the drawn
figure so the picker never shows a broken image.

## 11. Audio

Everything is synthesized with the Web Audio API; no files. Sound effects cover dice, hits, crits,
misses, fumbles, heals, buffs, debuffs, pickups, the tinker upgrade, deaths, engagements, the barge,
burning, fleeing, stuns, and win/lose.

The **soundtrack** is a 16-step sequencer scheduled on the audio clock. Tempo is
`MUSIC_BASE_BPM + MUSIC_BPM_STEP × phase`, 72 BPM at the drop rising in jumps to 156 in the final
ring, so every time the Ashfall closes the pulse audibly quickens, and the phase sting is a rising
sweep. Layers stack with the phase: kick and bass at the drop, hats from phase 1, syncopated bass
from phase 2, off-beat kicks from phase 3, an arpeggio from phase 4, and an urgency tick in the
final ring. Fights add a snare on 2 and 4 and bring the arpeggio in early. Outside the ring the
kick turns into a heartbeat. The root note rises a semitone per phase. `MUSIC_VOLUME` at the top of
the script sets the level (0 disables it).

## 12. Art

Every draw call checks for a sprite before falling back to primitives. `art/*.json` lists all 110
assets with sizes, frames, anchors and briefs; `art/README.md` explains the pipeline.

### Intro video
After START the game plays a short cinematic (`art/ui/intro_portrait.mp4` on tall screens, `art/ui/intro_landscape.mp4`
on wide ones), shown whole on black. Tap, click or any key skips; `ended`, a load error or an unsupported codec all
land on the menu, and the video is preloaded while the title is up so it usually starts instantly. Headless test
browsers cannot decode H.264, so the tests only cover the skip and error paths plus a generated WebM for the
play-to-end path.

### Class picker fit
The picker never scrolls: after each draw it measures its screen and shrinks the 2:3 art card to fit. If that would
leave the art under `PICKER_MIN_ART` px tall it switches the screen to a compact text layout instead (smaller stats,
no family line or jump dots) and lets the art grow back into the freed space.

### Painted UI plates and frames
Buttons draw their painted plates with CSS `border-image` (nine-slice, `round` middle band) from `art/ui/plate_*.webp`,
picked by colour class: gold for the primary action, cyan for online, pink for the rest, plain for secondary, and a
darker gold plate for the pressed state. Panels (`.box`, `.card`) get the iron frame; guide headings get a section
icon and the chain divider; wide screens put the skull-and-banner frame painting behind the guide. All of it switches
on only when the art loader has the plates, so the offline build keeps the flat CSS look. Phones use smaller plate
borders so the hotseat row still fits on one line.

### Painted menu
The main menu draws a painting behind the UI (`ui.menu.portrait` / `ui.menu.landscape`, chosen by orientation,
cover-fit, anchored bottom or right, slow drift). In portrait the wordmark and buttons sit on a plate in the upper
half that fades into the painting; in landscape they stack down the left 45 %. The controls table is hidden on the
painted menu because it lives in the guide. `art/ui/wireframes/` holds the layout guides used to brief the art.

### Painted terrain
The eight tile types come from one generated contact sheet, cut into eight square variants each and drawn at
32 px from 64 px sources (the map canvas renders at up to 2× on high-DPI screens). Painted ground is rich and
dark, so `renderMap` runs a readability pass when tiles are present: per-type tints (`TILE_TINT`) calm the water,
green the grass and cool the rock; a dark cliff edge with a light lip is drawn wherever a blocking tile meets open
ground, and a pale shoreline where water meets land. The minimap is drawn from tile types in the flat palette so it
reads at a glance. Sheet-drawn figures get the same class-colour rim as the cutouts so they pop off the ground.

### Run cycles, backdrops and the d20
All six classes now have real six-frame run sheets on the overworld (`char.<id>.walk`), keyed to the walk phase so
the stride matches the ground covered, mirrored for leftward travel, with the white-silhouette hit flash built from
the sheet. Standing still shows the portrait cutout, so stopping reads as turning to face the camera. The
encounter scene draws a painted backdrop chosen by screen aspect (the Ashfall observatory at dusk), scaled to cover
and anchored to the ground, with a translucent plate behind each fighter's name and bars. The d20 is the painted
obsidian-and-gold die: faces 1–20 from the sheet, seven motion-blurred frames while it tumbles.

### Overworld portraits and single-image animation
The same cutouts walk the island (`PORTRAIT_WORLD_H` px tall, downscaled once to a small copy, with a faint
class-coloured rim behind so they read on busy tiles). There is one still per class, so motion is procedural
(`PORTRAIT_ANIM`): walking bounces the figure, rocks it about its feet, leans it into its direction of travel and
adds a touch of squash and stretch; idle breathes and sways slowly; attacking is a hard lean into the target and a
hit recoils and flashes the white silhouette. Real walk cycles can replace this by supplying `char.<id>.walk`
frame sheets, which `drawFigure` already prefers when present.

### Combat portraits
The encounter scene draws each fighter's class portrait instead of the drawn figure. The portrait's black backdrop
is keyed out once per class (flood fill from the border over near-black pixels, so black inside the character
survives), the cutout is scaled to about half the screen height, mirrored for the right-hand fighter, and a white
silhouette of it flashes on hits. Name, bars and statuses sit above the portrait; on phones the matchup label and
medkit count move to their own line. The drawn figure remains the fallback offline or before the portrait loads.
First load is staged for slow links: the orientation's title painting alone, then the intro video buffers, then
portraits and the other painting (once the video can play through, six seconds later, or when the menu opens).
The video gets its source only after the painting is on screen so it never delays the page load event.
Keying runs in an inline Web Worker, one class at a time, and only once the menu is up, so the title screen
and the intro video never stall on it. The title's blurred backdrop is a 24-pixel copy of the painting scaled up
rather than a CSS blur filter, and the canvas is not painted at all behind the title or the intro.

## 13. Title review

"Roll to Live" is honest about the two pillars (dice, survival) but it reads like an instruction
rather than a name: it is generic, hard to own as a brand, and the "roll" pun lands as tabletop
tutorial rather than post-apocalyptic tension. It also has no image attached to it.

Options considered:

| Title | For | Against |
|---|---|---|
| **Ashfall** (chosen working title) | One word, evocative, already the name of the shrinking ring so the world teaches the title. Strong logo potential. | Used by a couple of small indie games; pair it with the tagline to stay distinctive. |
| Roll to Live | Clear mechanics. | Generic, instructional, weak as a brand. Kept as the tagline: "Ashfall — roll to live." |
| Last Barge | Concrete goal, memorable. | Says nothing about dice or magic. Good name for the mode or the final phase. |
| Ten Drop | Punchy, refers to the ten contestants. | Obscure until explained. |
| Safe City | The promised land. | Too soft for a game about killing nine people. |

Final: the game is **Outborn** (the contestants are outborn, born outside the walls, fighting for a place inside). "Roll to live." stays as the tagline. The island is **Ashfield** and the storm ring is **the Ashfall**. The title is a one-line
constant (`GAME_TITLE`) so it can be switched in seconds.

## 14. Roadmap after v1

- Reconnect to reclaim a botified survivor; server-side dice for anti-cheat.
- Persistent progression: unlock cosmetics and a 7th class.
- More island biomes, day/night, weather that modifies rolls.
- Team rounds (family pairs) and 2v2 encounters.
