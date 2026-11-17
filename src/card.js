// The narrative card: one heading, one or two sentences, an optional evidence block, an optional note.
// Its words come from the step's entry in src/lang/*.js; the step in steps.js only picks the block.
import { DECK } from './deck.js';
import { icon } from './icons.js';

// Evidence blocks. A step names one with block: 'facts' and gives its words in the language file.
export const BLOCKS = {
  // rows: [[icon, text], ...]
  facts: ({ rows = [] }) => `
    <ul class="facts">
      ${rows.map(([ic, html]) => `<li>${icon(ic)}<span>${html}</span></li>`).join('')}
    </ul>`,
  // table: { head: [...], rows: [[...], ...] }; columns after the first are right-aligned figures.
  table: ({ table: t = {} }) => `
    <table class="tbl">
      <thead><tr>${(t.head || []).map((h) => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${(t.rows || []).map((r) => `<tr>${r.map((c, k) => `<td class="${k ? 'mono' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`,
  // stat: { value, unit, label }: one figure that carries the step.
  stat: ({ stat: s = {} }) => `
    <div class="stat"><span class="stat-v mono">${s.value ?? ''}</span>${s.unit ? `<span class="stat-u">${s.unit}</span>` : ''}
    ${s.label ? `<p class="stat-l">${s.label}</p>` : ''}</div>`,
};

// The opening and the closing: a label, the title, a subtitle, the people and one line of place.
//   kicker  a small label in a pill        people  [[label, [name, name]], ...]
//   name    the big title                  sig     ['part', 'part', ...], set apart by dots
function hero(c) {
  const people = c.people || [];
  const sig = c.sig || [];
  return `
    ${c.kicker ? `<p class="kicker pill" data-in>${c.kicker}</p>` : ''}
    <h1 data-in>${c.name || DECK.name}</h1>
    ${c.sub ? `<p class="sub" data-in>${c.sub}</p>` : ''}
    ${people.length ? `<dl class="people" data-in>${people.map(([label, names]) => `
      <div><dt>${label}</dt><dd>${[].concat(names).map((n) => `<span>${n}</span>`).join('')}</dd></div>`).join('')}
    </dl>` : ''}
    ${sig.length ? `<p class="byline" data-in>${sig.map((s) => `<span>${s}</span>`).join('')}</p>` : ''}`;
}

export function renderCard(c = {}, layout = 'side') {
  const el = document.createElement('article');
  el.className = `card card--${layout}`;
  if (c.id) el.dataset.step = c.id;
  if (layout === 'hero') {
    el.innerHTML = hero(c);
    return el;
  }
  const make = c.block && BLOCKS[c.block];
  if (c.block && !make) console.warn(`[card] unknown block "${c.block}"`);
  const block = make ? make(c) : '';
  el.innerHTML = `
    ${c.kicker ? `<p class="kicker" data-in>${c.kicker}</p>` : ''}
    ${c.title ? `<h1 data-in>${c.title}</h1>` : ''}
    ${c.body ? `<p class="body" data-in>${c.body}</p>` : ''}
    ${block ? `<div class="block" data-in>${block}</div>` : ''}
    ${c.note ? `<p class="note" data-in>${c.note}</p>` : ''}`;
  return el;
}
