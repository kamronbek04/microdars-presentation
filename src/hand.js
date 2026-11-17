// Handwritten digits and signs, each drawn as single strokes, so a visual can "write" them with a
// stroke animation (the pupil's answers on the card) and the page can show a pupil's practice rows.
//
//   hand('2 + 3 = 5')                    an inline SVG, 1em tall, as wide as the text needs
//   hand('3', { ink: true })             the same, ready to be written: its strokes start hidden
//   writeIn(tl, svgEl, at, speed)        adds the writing of one SVG to a GSAP timeline
//
// Glyphs live in a 10 x 14 box (y down, baseline at 14), drawn the way a first-grader is taught.

const GLYPHS = {
  1: ['M2.4 4.2 L6.6 0.9 L6.6 13.4'],
  2: ['M1.6 4.1 C1.9 2 3.5 0.9 5.3 0.9 C7.3 0.9 8.6 2.3 8.6 4 C8.6 6.5 5.9 8.7 1.5 13.3 L9.1 13.3'],
  3: ['M1.7 2.7 C2.6 1.5 3.9 0.9 5.2 0.9 C7.2 0.9 8.4 2.1 8.4 3.7 C8.4 5.4 6.9 6.6 4.6 6.7 C7.2 6.8 8.9 8.3 8.9 10.2 C8.9 12.3 7.2 13.5 5 13.5 C3.4 13.5 2.1 12.9 1.3 11.8'],
  4: ['M5.9 0.9 L1.2 9.5 L9.4 9.5', 'M7.1 5.3 L7.1 13.5'],
  5: ['M8.5 0.9 L2.7 0.9 L2 6.3 C3 5.6 4.1 5.3 5.2 5.3 C7.5 5.3 9 7 9 9.3 C9 11.8 7.2 13.5 4.9 13.5 C3.3 13.5 2 12.9 1.2 11.8'],
  '+': ['M5 4.6 L5 11.2', 'M1.7 7.9 L8.3 7.9'],
  '−': ['M1.7 7.9 L8.3 7.9'],
  '=': ['M1.7 6.2 L8.3 6.2', 'M1.7 9.6 L8.3 9.6'],
  ',': ['M3.4 12.2 L2.4 15'],
};
const ADVANCE = { ' ': 4.6, ',': 5.2 };
const H = 16; // the viewBox height: the 14-unit box plus room for the stroke and a comma's tail

// A small deterministic wobble per glyph, so a row never looks typeset.
function rng(seed) {
  let s = seed % 2147483647 || 7;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
}

export function hand(text, { ink = false, seed = 3, wobble = 1, cls = '' } = {}) {
  const r = rng(seed * 7919);
  let x = 0;
  const parts = [];
  for (const ch of String(text)) {
    const strokes = GLYPHS[ch];
    if (!strokes) {
      x += ADVANCE[ch] ?? 4.6;
      continue;
    }
    const rot = (r() * 3.2 * wobble).toFixed(2);
    const dy = (r() * 0.45 * wobble).toFixed(2);
    parts.push(`<g transform="translate(${x.toFixed(2)} ${dy}) rotate(${rot} 5 7)">${strokes.map((d) => `<path d="${d}" pathLength="1"/>`).join('')}</g>`);
    x += ADVANCE[ch] ?? 10.6;
  }
  const w = Math.max(1, x - 0.6);
  return `<svg class="hand${ink ? ' ink' : ''}${cls ? ` ${cls}` : ''}" viewBox="-0.8 -0.8 ${(w + 1.6).toFixed(2)} ${H}" style="width:${((w + 1.6) / H).toFixed(3)}em" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${parts.join('')}</g></svg>`;
}

/** Writes one hand() SVG made with { ink: true }: stroke by stroke, at `speed` seconds a stroke. */
export function writeIn(tl, svg, at, speed = 0.22) {
  if (!svg) return;
  const paths = [...svg.querySelectorAll('path')];
  paths.forEach((p, k) => {
    const t = typeof at === 'number' ? at + k * speed * 0.9 : k ? `>-${speed * 0.1}` : at;
    tl.set(p, { opacity: 1 }, t);
    tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: speed, ease: 'power1.inOut' }, t);
  });
}
