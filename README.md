# Mikrodars taqdimoti · 1-sinf matematika

"1 dan 5 gacha boʻlgan sonlar bilan amallar bajarish": a 29-step web presentation of a 1st-grade math
micro-lesson (Jizzax, 2026), made from the deck kit (`..\deck-kit`) without the map. Uzbek only.
The source PowerPoint, the facts and the open questions are in `BRIEF.md`.

The background is an exercise-book page (light, the default) or a chalkboard (dark, the T key).
Every number keeps one colour on every step: 1 coral, 2 yellow, 3 green, 4 sky, 5 purple.

## Run, present, share

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5181. `present.bat` builds the deck and opens it on this PC;
`share.bat` gives a temporary public link from this PC; `npm run build` makes a `dist` folder
(about 320 KB) that works on any web host. The deck needs no internet once loaded.

Keys: Right arrow, Space, Page Down, a clicker or a left click go forward; Left arrow, Page Up or a
right click go back. F is full screen, T the page or the chalkboard, Home and End the first and last
step. `#12` at the end of the address opens step 12.

## Where things live

| File | What it holds |
| --- | --- |
| `src/steps.js` | The storyboard: 29 steps, their layout, panel, rail station and page view |
| `src/lang/uz.js` | Every word on screen, by step id, and the panels' words under `viz` |
| `src/visuals.js` | The animated panels: balls, sort, missing, stairs, compose, train, worksheet, traffic, timebar, stages, flow, checklist |
| `src/backdrop.js` | The page behind: one page per chapter, the red margin line, the pencil practice rows |
| `src/hand.js` | Handwritten digits drawn stroke by stroke (the pupil's card, the pencil rows) |
| `src/styles.css` | Colours at the top (the five numbers, the page, the chalkboard), then every part |
| `src/engine.js` | Steps, keys and transitions (the kit's engine; what leaves fades where it stands) |

To change a word, edit `src/lang/uz.js`. Uzbek uses ʻ (U+02BB) in oʻ and gʻ and ʼ (U+02BC) for the
tutuq belgisi; subtraction uses − (U+2212). `eq('3 + 1 = 4')` colours each digit by its number.

## Checking

With the dev server running, `npm run shots` photographs every step (`--theme light|dark|both`,
`--size 1366x768`, `--steps 3-7`) into `shots/`; open `shots/index.html`.
