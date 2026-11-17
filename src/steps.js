// The storyboard: one entry per step, in order (approved 2026-11-17, 29 steps). A step's words are
// not here: they live under steps.<id> in src/lang/uz.js.
//
//   id      the key of the step's words (title, body, note, and the rows of a block)
//   layout  'side' (default: card on the left, visual on the right), 'center' (one statement),
//           'top' (a heading over a wide visual), 'hero' (the opening and the close)
//   block   evidence on the card: 'facts', 'table' or 'stat' (see card.js)
//   visual  an animated panel: { type, data, phase } (see visuals.js)
//   rail    the station lit on the progress rail (1, 2, ...) or 'done'; leave it out to hide the rail
//   bg      the page behind: { view, grid, marks, sway } (see backdrop.js)
//   cue     shows the "Keyingi" hint in the corner (the opening step)
import { T } from './i18n.js';

// Statements on the bare page: the pupil's marks come up around the words.
const open = (view) => ({ view, marks: 1 });

const STORY = [
  { id: 'open', layout: 'hero', cue: true, visual: { type: 'balls', data: 'balls', phase: 0 }, bg: open('cover') },
  { id: 'idea', layout: 'center', bg: open('cover') },

  // 1 Yondashuv
  { id: 'why', rail: 1, visual: { type: 'flow', data: 'why', phase: 1 }, bg: { view: 'c1' } },
  { id: 'why2', rail: 1, visual: { type: 'flow', data: 'why', phase: 3 }, bg: { view: 'c1' } },
  { id: 'thinker', layout: 'center', bg: open('c1') },

  // 2 Maqsad
  { id: 'goal', layout: 'top', rail: 2, visual: { type: 'stages', data: 'goals', phase: 0 }, bg: { view: 'c2' } },
  { id: 'goal2', layout: 'top', rail: 2, visual: { type: 'stages', data: 'goals', phase: 1 }, bg: { view: 'c2' } },

  // 3 Dars ritmi
  { id: 'rhythm', layout: 'top', rail: 3, visual: { type: 'timebar', data: 'lesson', phase: 0 }, bg: { view: 'c3' } },
  { id: 'micro', layout: 'top', rail: 3, visual: { type: 'timebar', data: 'lesson', phase: 1 }, bg: { view: 'c3' } },

  // 4 Oʻyinlar: the warm-up, then the four games, each played one step at a time
  { id: 'order', rail: 4, visual: { type: 'sort', data: 'order', phase: 0 }, bg: { view: 'order' } },
  { id: 'g1', rail: 4, visual: { type: 'missing', data: 'missing', phase: 0 }, bg: { view: 'g1' } },
  { id: 'g1why', rail: 4, visual: { type: 'missing', data: 'missing', phase: 1 }, bg: { view: 'g1' } },
  { id: 'g1all', rail: 4, visual: { type: 'missing', data: 'missing', phase: 2 }, bg: { view: 'g1' } },
  { id: 'g2', rail: 4, visual: { type: 'stairs', data: 'stairs', phase: 0 }, bg: { view: 'g2' } },
  { id: 'g2up', rail: 4, visual: { type: 'stairs', data: 'stairs', phase: 1 }, bg: { view: 'g2' } },
  { id: 'g2down', rail: 4, block: 'facts', visual: { type: 'stairs', data: 'stairs', phase: 2 }, bg: { view: 'g2' } },
  { id: 'g3', rail: 4, visual: { type: 'compose', data: 'compose', phase: 0 }, bg: { view: 'g3' } },
  { id: 'g3a', rail: 4, visual: { type: 'compose', data: 'compose', phase: 1 }, bg: { view: 'g3' } },
  { id: 'g3b', rail: 4, visual: { type: 'compose', data: 'compose', phase: 2 }, bg: { view: 'g3' } },
  { id: 'g4', rail: 4, visual: { type: 'train', data: 'train', phase: 0 }, bg: { view: 'g4' } },
  { id: 'g4match', rail: 4, visual: { type: 'train', data: 'train', phase: 1 }, bg: { view: 'g4' } },

  // 5 Mustahkamlash
  { id: 'card', rail: 5, visual: { type: 'worksheet', data: 'worksheet', phase: 0 }, bg: { view: 'c5' } },
  { id: 'cardDone', rail: 5, visual: { type: 'worksheet', data: 'worksheet', phase: 1 }, bg: { view: 'c5' } },
  { id: 'cardHelp', rail: 5, visual: { type: 'worksheet', data: 'worksheet', phase: 2 }, bg: { view: 'c5' } },

  // 6 Baholash
  { id: 'svetofor', rail: 6, visual: { type: 'traffic', data: 'traffic', phase: 0 }, bg: { view: 'c6' } },
  { id: 'criteria', rail: 6, visual: { type: 'checklist', data: 'criteria', phase: 1 }, bg: { view: 'c6' } },

  // 7 Xulosa
  { id: 'advice', layout: 'top', rail: 7, visual: { type: 'stages', data: 'advice', phase: 1 }, bg: { view: 'c7' } },
  { id: 'quote', layout: 'center', bg: open('c7') },
  { id: 'close', layout: 'hero', visual: { type: 'balls', data: 'balls', phase: 1 }, bg: open('end') },
];

/** The steps with the words of the current language. */
export function buildSteps() {
  const S = T().steps || {};
  return STORY.map((s) => ({ ...s, card: { ...(S[s.id] || {}), block: s.block, id: s.id } }));
}
