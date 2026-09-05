# ROLL TO LIVE — Design Wireframe

A browser/mobile survival game. Ten contestants are dropped on a post-apocalyptic island of
science and magic. The last one standing earns a seat on the extraction barge to the Safe City,
for themselves and the family they fight for.

`index.html` is the complete, playable first version: one file, no dependencies, runs offline.

---

## 1. Core loop

```
 ┌─────────────┐   walk / loot / scout   ┌─────────────┐   choose ability   ┌──────────────┐
 │  OVERWORLD  │ ──────────────────────▶ │  ENCOUNTER  │ ─────────────────▶ │  ROLL d20    │
 │ (real-time) │ ◀────────────────────── │ (turn-based)│ ◀───────────────── │  resolve     │
 └─────────────┘   win / flee / die      └─────────────┘   next turn        └──────────────┘
        │
        ▼  the Ashfall (safe zone) shrinks every 50 s and forces the survivors together
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
| Solo | 1 | 9 | Standard round. |
| Hotseat 2P / 3P / 4P | 2–4 | fill to 10 | Local pass-and-play on one device. Each human gets a 20 s walking turn, then the device is passed. Any human who is attacked plays their own defense. Humans can fight each other. |

Networked multiplayer is deliberately out of scope for v1 (single offline file). Combat is
already a pure function of `(state, d20 roll)`, so a future netcode layer only needs to sync
inputs and dice seeds.

## 3. Controls (shown on screen at load)

| Action | Keyboard | Touch |
|---|---|---|
| Move | WASD / Arrow keys | Left-half virtual joystick |
| Engage nearby contestant | E or Space | ENGAGE button (bottom-right) |
| Pick ability in combat | 1–6 or click | Tap button |
| Roll the d20 | Space / Enter / click | Tap the ROLL button or the dice |
| Pause / controls | P or Esc | Tap ⏸ (top-right) |
| Mute | M | ♪ (top-right) |

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
| DEF | Target number. An attack hits if `d20 + ATK + bonuses ≥ DEF`. |
| ATK | To-hit modifier, also added to weapon damage. +1 per kill (max +4). |
| SPD | Initiative and flee rolls. |
| EN | Energy for abilities. +5 per combat turn. |

Proficiency: each class is proficient with 1–2 weapon types → +2 to hit, +2 damage.

## 6. The six classes

| Class | HP | DEF | ATK | SPD | EN | Proficiency | Fighting for |
|---|---|---|---|---|---|---|---|
| **Warden** (ranger) | 72 | 13 | +3 | 6 | 30 | Ranged | a daughter at the checkpoint |
| **Technomancer** | 62 | 12 | +2 | 5 | 45 | Tech, Arcane | a brother in the reactor wards |
| **Bruiser** | 100 | 15 | +2 | 3 | 25 | Blunt, Blade | three kids in the dust camps |
| **Hexblade** | 72 | 13 | +3 | 5 | 35 | Blade, Arcane | a dead partner's promise |
| **Alchemist** (medic) | 78 | 12 | +2 | 5 | 40 | Ranged, Arcane | a father on the transplant list |
| **Wraith** (scavenger) | 64 | 14 | +4 | 8 | 35 | Blade, Ranged | nobody, just the way out |

### Abilities (each class has Attack, four specials, and Flee)

| Class | Ability | Cost / CD | Effect |
|---|---|---|---|
| Warden | Aimed Shot | 6 / 2 | Weapon +1d6, +4 to hit |
| | Snare Trap | 8 / 4 | 1d6, target loses next turn |
| | Hunter's Focus | 5 / 4 | +3 to hit, 3 turns |
| | Volley | 10 / 3 | 3 weapon attacks at −2 |
| Technomancer | Arc Bolt | 6 / 1 | 2d6, +2 to hit |
| | Drone Swarm | 10 / 4 | 1d4, then 4/turn for 3 turns |
| | Overclock | 8 / 4 | +4 hit, +4 dmg, 2 turns |
| | Nanite Repair | 10 / 3 | Heal 2d8+4 |
| Bruiser | Crushing Blow | 6 / 2 | Weapon +1d8, −2 to hit |
| | Iron Skin | 7 / 4 | +4 DEF, 3 turns |
| | Ground Slam | 9 / 3 | 1d10, target −3 DEF 2 turns |
| | Berserk | 5 / 5 | +5 dmg, −3 DEF, 3 turns |
| Hexblade | Cursed Strike | 5 / 1 | Weapon +1d6 |
| | Soul Leech | 8 / 3 | 2d6, heal half |
| | Hex of Rot | 7 / 4 | Target −4 to hit, 3 turns |
| | Shadowstep | 8 / 4 | Next enemy attack misses |
| Alchemist | Acid Flask | 6 / 2 | 2d6, target −2 DEF 2 turns |
| | Stim Shot | 10 / 3 | Heal 3d6+2 |
| | Toxic Cloud | 9 / 4 | Poison 5/turn, 3 turns |
| | Adrenaline | 6 / 4 | +2 hit, +3 dmg, 3 turns |
| Wraith | Backstab | 6 / 2 | Weapon +1d6, crits on 17+ |
| | Smoke Bomb | 7 / 4 | +5 DEF, 2 turns |
| | Quick Draw | 9 / 3 | Two weapon attacks |
| | Venom Blade | 7 / 3 | Weapon + 3 poison/turn, 3 turns |

## 7. Weapons

Five types × four tiers. Tier sets the damage dice (weapon attacks add ATK); type sets who is proficient.

| Type | T1 (1d8) | T2 (1d10) | T3 (2d8) | T4 (2d10+2) |
|---|---|---|---|---|
| Blade | Shiv | Rune Machete | Plasma Katana | Voidreaver |
| Blunt | Lead Pipe | Rebar Maul | Gravity Hammer | Titan Fist |
| Ranged | Rusty Revolver | Scrap Bow | Railgun | Storm Rifle |
| Arcane | Bone Wand | Ember Staff | Frost Scepter | Eclipse Focus |
| Tech | Shock Prod | Tesla Gauntlet | Nano Blaster | Singularity Cannon |

Crates drop higher tiers as the Ashfall phase rises. Killing someone lets you take their
weapon if it is better. Other crate loot: medkit (+40 HP), armor plate (+1 DEF, max +3),
power cell (+10 max EN), supply cache (score).

## 8. Dice rules

- Attack: roll d20. Natural 20 always hits and deals double damage. Natural 1 is a fumble
  (you hurt yourself for 3). Otherwise hit if `d20 + ATK + proficiency + buffs ≥ target DEF + buffs`.
- Heal / buff: natural 1 fails, natural 20 doubles the heal (or extends the buff by a turn).
- Debuff: must beat the target's DEF like an attack.
- Flee: `d20 + SPD ≥ 10 + enemy SPD`. Failure gives the enemy a free strike.
- Initiative: `d20 + SPD`. Status durations tick at the end of each full round.

## 9. AI

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

## 11. Roadmap after v1

- Networked mode: authoritative server, seeded dice, input sync (combat is already deterministic).
- Persistent progression: unlock cosmetics and a 7th class.
- More island biomes, day/night, weather that modifies rolls.
- Team rounds (family pairs) and 2v2 encounters.
