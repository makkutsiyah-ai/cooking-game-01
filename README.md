# cooking-game-01

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/makkutsiyah-ai/cooking-game-01/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/makkutsiyah-ai/cooking-game-01/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Warung Kilat is a fast Indonesian street-food cooking game for the [make.fun "Make the best cooking game" bounty](https://make.fun/bounty/best-cooking-game-20261125-0137). Customers order nasi goreng, mie goreng, sate ayam and more; you grab ingredients from the pantry, chop on the board, fry in the wok, grill the satay, assemble the plate and serve before patience runs out. Bimo, the AI sous-chef, chops beside you, and an autopilot AI can play the whole game on its own.

## The game

- **Time-management kitchen**: pick, process, plate, serve — every action answers at once, with a patience bar on every ticket and tips for fast service.
- **Progression**: five Career days, each unlocking a new recipe (Nasi Goreng, Mie Goreng, Sate Ayam, Gado-Gado, Ayam Geprek, Es Teh Manis), plus a 120-second Rush mode.
- **Three challenges**: Rush Hour (orders arrive twice as fast), Tanpa Salah (three mistakes end the day), Pesanan Misteri (recipes hidden on the ticket).
- **Two AI elements**: Bimo the sous-chef, who chops what the oldest order needs and carries it to the plate, and a full autopilot that plays the game with the same clicks a human uses.
- **Tutorial**: the first day walks you through one order, step by step.
- **All original**: every sprite, sound and name is drawn or synthesized in code — no images, no audio files, no network. Sounds are WebAudio oscillators and filtered noise.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `game/` and `screenshots/` to `out/` and writes `out/dossier.json`. Serve `game/` with any static server (for example `node serve.ts` in the kit, or `python3 -m http.server`) and open `game/index.html` in desktop Chrome. Screenshots are staged with `?shot=board|assembly|serve|ai`.

## Layout

- `main.ts` — entrypoint; copies the game and screenshots, writes the dossier.
- `vendor/makefun-game.ts` — make.fun's dossier library, copied from the kit.
- `game/index.html` — the page; `game/src/` is the game, one file per job: `config.js` (recipes, levels, layout), `state.js` (game state), `orders.js` (tickets, patience, scoring), `kitchen.js` (stations, plate, hands), `chef.js` (movement and player actions), `ai.js` (sous-chef and autopilot), `render.js` (all canvas drawing), `input.js` (mouse and keyboard), `shots.js` (screenshot staging), `audio.js` (synthesized sounds), `random.js` (seeded RNG), `main.js` (bootstrap and loop).
- `screenshots/` — four real renders of the game running: the kitchen and order board, a dish mid-assembly, a plate ready to serve, and the autopilot playing.

---

Entered on [make.fun](https://make.fun/?ref=4jehqa2y&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards
