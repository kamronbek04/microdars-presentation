// The animated panels beside the card (or under it on 'top' steps, or beside the title on 'hero').
//
// A step shows one with  visual: { type: 'missing', data: 'missing', phase: 0 }:
//   type  = one of the VISUALS at the bottom of this file
//   data  = its words, under viz: { missing: { ... } } in the language file
//   phase = how far it has played. Consecutive steps with the same type and data keep the panel
//           and play its next phase, so one panel can tell a short story across steps (a game:
//           the question first, then the answer).
//
// viz(host, html, phases) mounts the HTML and runs each phase as GSAP animations: every phase gets
// its own timeline (its times count from the phase's start), appended after the phase before.
// Jumping to a step or going back rebuilds the panel and fast-forwards the same timeline, so the
// animated and the still states never differ.
// Rules: anything a later phase reveals starts hidden in styles.css (opacity: 0; visibility: hidden).
// Positions are in rem or in SVG units, never in pixels, so a panel survives a window resize.
// Every number keeps its colour everywhere: 1 coral, 2 yellow, 3 green, 4 sky, 5 purple (.n1-.n5).
import { gsap } from 'gsap';
import { icon } from './icons.js';
import { T, fmt } from './i18n.js';
import { hand, writeIn } from './hand.js';

const words = (data) => T().viz?.[data] || {};
const q = (r, s) => r.querySelector(s);
const qa = (r, s) => [...r.querySelectorAll(s)];
// The colour class of an item counted from 0: n1 for the first, n5 for the fifth.
const nth = (k) => `n${(k % 5) + 1}`;

function toEl(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

const pop = (tl, els, when, o = {}) =>
  tl.fromTo(els, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.08, ...o }, when);
const popIn = (tl, els, when, stagger = 0.08) =>
  tl.fromTo(els, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2.4)', stagger }, when);
// Draws an SVG stroke made with pathLength="1" and stroke-dasharray 1 1.
// The stroke starts hidden in styles.css (opacity: 0): a round cap would otherwise show as a dot.
const draw = (tl, els, when, o = {}) => {
  tl.set(els, { opacity: 1 }, when);
  return tl.fromTo(els, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', ...o }, when);
};
// A figure that counts up to its value, in the current language's number style.
function countUp(tl, el, value, when, { duration = 1.6, digits = 0 } = {}) {
  const o = { v: 0 };
  tl.to(o, { v: value, duration, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v, digits); } }, when);
}
// Moves an SVG element along a curve from -> via -> to (SVG units), by its transform attribute.
function along(tl, el, from, via, to, when, duration = 0.7, ease = 'power1.inOut') {
  const o = { t: 0 };
  const place = () => {
    const t = o.t;
    const u = 1 - t;
    const x = u * u * from[0] + 2 * u * t * via[0] + t * t * to[0];
    const y = u * u * from[1] + 2 * u * t * via[1] + t * t * to[1];
    el.setAttribute('transform', `translate(${x.toFixed(3)} ${y.toFixed(3)})`);
  };
  // immediateRender: false, or every segment would place the element at its own start the moment
  // the timeline is built (a wagon jumped mid-flight before the step had played).
  tl.fromTo(o, { t: 0 }, { t: 1, duration, ease, immediateRender: false, onStart: place, onUpdate: place }, when);
}

function viz(host, html, phases) {
  const el = toEl(html);
  host.appendChild(el);
  const original = el.innerHTML;
  const originalClass = el.className;
  const originalStyle = el.getAttribute('style') || '';
  let tl = null;
  let cur = -1;
  const build = (from, to, lead = 0) => {
    const t = gsap.timeline({ paused: true });
    if (lead) t.to({}, { duration: lead });
    for (let k = from; k <= to; k++) {
      if (!phases[k]) continue;
      const sub = gsap.timeline();
      phases[k](el, sub);
      t.add(sub);
    }
    return t;
  };
  return {
    el,
    set(p, { instant = false, lead = 0 } = {}) {
      if (tl) {
        tl.progress(1, false);
        tl.kill();
        tl = null;
      }
      if (instant || p < cur) {
        el.innerHTML = original;
        el.className = originalClass;
        el.setAttribute('style', originalStyle);
        const t = build(0, p);
        t.progress(1, false);
        t.kill();
      } else if (p > cur) {
        tl = build(cur + 1, p, lead);
        tl.play();
      }
      cur = p;
    },
    destroy() {
      tl?.kill();
      el.remove();
    },
  };
}

/* ---------- balls: the five numbers on a ring (the opening), then on a number line (the close) ----
   phase 0: the ring is drawn and the balls come in, 1 to 5.  phase 1: they settle on a number line. */
function balls(host) {
  const R = 11.4;
  const C = 17;
  const ring = [0, 1, 2, 3, 4].map((k) => {
    const a = ((-126 + k * 72) * Math.PI) / 180;
    return [C + R * Math.cos(a), C + R * Math.sin(a)];
  });
  const line = [0, 1, 2, 3, 4].map((k) => 3.4 + k * 6.8);
  return viz(host, `
  <div class="viz viz-balls">
    <svg class="bl-ring" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="${R}" pathLength="1"/></svg>
    <svg class="bl-line" viewBox="0 0 34 34" aria-hidden="true">
      <path class="bl-axis" d="M0.4 28.9 L33.6 28.9" pathLength="1"/>
      ${line.map((x) => `<path class="bl-tick" d="M${x} 28 L${x} 29.8"/>`).join('')}
    </svg>
    ${ring.map(([x, y], k) => `<span class="ball n${k + 1}" style="--x:${x.toFixed(2)};--y:${y.toFixed(2)}"><span class="bl-in"><b>${k + 1}</b></span></span>`).join('')}
  </div>`, [
    (r, tl) => {
      draw(tl, q(r, '.bl-ring circle'), 0, { duration: 1.8 });
      tl.fromTo(qa(r, '.ball'), { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'back.out(2.2)', stagger: 0.24 }, 0.25);
    },
    (r, tl) => {
      tl.to(q(r, '.bl-ring'), { autoAlpha: 0, duration: 0.5 }, 0);
      tl.set(q(r, '.bl-line'), { autoAlpha: 1 }, 0.1);
      draw(tl, q(r, '.bl-axis'), 0.1, { duration: 1 });
      tl.fromTo(qa(r, '.bl-tick'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.08 }, 0.5);
      qa(r, '.ball').forEach((b, k) => tl.to(b, { '--x': line[k], '--y': 24.4, duration: 1.2, ease: 'power3.inOut' }, 0.35 + k * 0.1));
    },
  ]);
}

/* ---------- sort: mixed number cards put in order ----------
   viz.<data> = { start: [3, 1, 5, 2, 4] }   (the order the cards lie in before the pupil sorts them)
   phase 0: the cards fall in mixed, then 1, 2, 3, 4, 5 move to their places and the arrow is drawn. */
function sort(host, data) {
  const start = words(data).start || [3, 1, 5, 2, 4];
  const tilt = [-7, 5, -4, 6, -5];
  return viz(host, `
  <div class="viz viz-sort">
    <div class="srt-row">
      ${start.map((v, slot) => `<span class="tile n${v}" data-v="${v}" style="--s:${slot}"><b>${v}</b></span>`).join('')}
    </div>
    <svg class="srt-arrow" viewBox="0 0 42 4" aria-hidden="true"><path d="M3.5 2 L38.5 2 M36.6 0.7 L38.6 2 L36.6 3.3" pathLength="1"/></svg>
  </div>`, [
    (r, tl) => {
      const tiles = qa(r, '.tile');
      tl.fromTo(tiles, { autoAlpha: 0, yPercent: -45, rotation: 0 }, {
        autoAlpha: 1, yPercent: 0, rotation: (k) => tilt[k], duration: 0.6, ease: 'back.out(1.7)', stagger: 0.08,
      }, 0);
      [1, 2, 3, 4, 5].forEach((v, k) => {
        const el = tiles.find((t) => Number(t.dataset.v) === v);
        if (!el) return;
        const at = 1.25 + k * 0.34;
        tl.set(el, { zIndex: 2 }, at);
        tl.to(el, { '--s': v - 1, rotation: 0, duration: 0.7, ease: 'power3.inOut' }, at);
        tl.to(el, { yPercent: -38, duration: 0.35, ease: 'power2.out', yoyo: true, repeat: 1 }, at);
        tl.set(el, { zIndex: 1 }, at + 0.7);
      });
      draw(tl, q(r, '.srt-arrow path'), '>', { duration: 0.8 });
    },
  ]);
}

/* ---------- missing: rows of number cards, one hidden in each ----------
   viz.<data> = { title, rows: [{ seq: [1, 2, 3, 4, 5], gap: 2 }] }
   phase 0: the rows, each with a "?".  phase 1: the first "?" turns over; its neighbours light up.
   phase 2: the other rows are solved and ticked. */
function missing(host, data) {
  const W = words(data);
  const rows = W.rows || [];
  return viz(host, `
  <div class="viz viz-missing sheet">
    <header class="ms-hd"><b>${W.title || ''}</b></header>
    ${rows.map((row) => `
      <div class="ms-row">
        ${row.seq.map((v, k) => (k === row.gap
          ? `<span class="tile gap n${v}"><span class="flip"><span class="face q"><b>?</b></span><span class="face a"><b>${v}</b></span></span></span>`
          : `<span class="tile n${v}" data-k="${k}"><b>${v}</b></span>`)).join('')}
        <span class="ms-ok">${icon('check')}</span>
      </div>`).join('')}
  </div>`, [
    (r, tl) => {
      qa(r, '.ms-row').forEach((row, i) => pop(tl, qa(row, '.tile'), 0.15 + i * 0.32, { stagger: 0.06 }));
    },
    (r, tl) => {
      const row = qa(r, '.ms-row')[0];
      const gap = rows[0]?.gap ?? 0;
      if (!row) return;
      tl.to(q(row, '.flip'), { rotationY: 180, duration: 0.8, ease: 'back.out(1.5)' }, 0.1);
      const near = qa(row, '.tile[data-k]').filter((t) => Math.abs(Number(t.dataset.k) - gap) === 1);
      tl.call(() => near.forEach((t) => t.classList.add('hint')), null, 0.75);
    },
    (r, tl) => {
      tl.call(() => qa(r, '.hint').forEach((t) => t.classList.remove('hint')), null, 0);
      qa(r, '.ms-row').slice(1).forEach((row, i) => {
        tl.to(q(row, '.flip'), { rotationY: 180, duration: 0.8, ease: 'back.out(1.5)' }, 0.1 + i * 0.45);
      });
      popIn(tl, qa(r, '.ms-ok'), 1.15, 0.12);
    },
  ]);
}

/* ---------- stairs: a staircase 1 to 5 and a counter that hops ----------
   viz.<data> = { up: '3 + 1 → 4', down: '5 − 2 → 3' }
   phase 0: the steps rise.  phase 1: the counter lands on 3 and hops one step up to 4.
   phase 2: it starts again on 5 and hops two steps down to 3. */
function stairs(host, data) {
  const W = words(data);
  const col = (k) => ({ x: 1.6 + (k - 1) * 7.4, top: 28.4 - k * 4.4 });
  const at = (k) => [col(k).x + 3.4, col(k).top - 1.55];
  const arc = (a, b, lift = 4.6) => {
    const [x1, y1] = at(a);
    const [x2, y2] = at(b);
    return { from: [x1, y1], via: [(x1 + x2) / 2, Math.min(y1, y2) - lift], to: [x2, y2] };
  };
  const hops = { up: [arc(3, 4)], down: [arc(5, 4), arc(4, 3)] };
  const path = (h) => `M${h.from[0].toFixed(2)} ${h.from[1].toFixed(2)} Q${h.via[0].toFixed(2)} ${h.via[1].toFixed(2)} ${h.to[0].toFixed(2)} ${h.to[1].toFixed(2)}`;
  return viz(host, `
  <div class="viz viz-stairs">
    <svg class="st-svg" viewBox="0 0 40 30" aria-hidden="true">
      <path class="st-ground" d="M0.4 28.4 L39.6 28.4"/>
      ${[1, 2, 3, 4, 5].map((k) => `
        <g class="st-col n${k}">
          <rect x="${col(k).x}" y="${col(k).top}" width="6.8" height="${(28.4 - col(k).top).toFixed(2)}" rx="0.7"/>
          <text x="${col(k).x + 3.4}" y="${col(k).top + 3.1}" text-anchor="middle" font-size="2.5">${k}</text>
        </g>`).join('')}
      ${hops.up.map((h) => `<path class="st-hop up" d="${path(h)}" pathLength="1"/>`).join('')}
      ${hops.down.map((h) => `<path class="st-hop down" d="${path(h)}" pathLength="1"/>`).join('')}
      <g class="st-token" transform="translate(${at(3).join(' ')})"><circle class="o" r="1.3"/><circle class="i" r="0.5"/></g>
    </svg>
    <span class="st-eq up"><span class="math">${W.up || ''}</span></span>
    <span class="st-eq down"><span class="math">${W.down || ''}</span></span>
  </div>`, [
    (r, tl) => {
      qa(r, '.st-col').forEach((g, k) => {
        tl.fromTo(q(g, 'rect'), { scaleY: 0, transformOrigin: '50% 100%', smoothOrigin: false }, { scaleY: 1, transformOrigin: '50% 100%', smoothOrigin: false, duration: 0.55, ease: 'back.out(1.6)' }, 0.1 + k * 0.16);
        tl.fromTo(q(g, 'text'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.4 + k * 0.16);
      });
    },
    (r, tl) => {
      const tok = q(r, '.st-token');
      const [x3, y3] = at(3);
      tl.set(tok, { autoAlpha: 1 }, 0);
      along(tl, tok, [x3, y3 - 5], [x3, y3 - 5], [x3, y3], 0, 0.6, 'bounce.out');
      pop(tl, q(r, '.st-eq.up'), 0.5);
      const h = hops.up[0];
      along(tl, tok, h.from, h.via, h.to, 1.1, 0.75);
      draw(tl, q(r, '.st-hop.up'), 1.1, { duration: 0.75, ease: 'power1.inOut' });
    },
    (r, tl) => {
      const tok = q(r, '.st-token');
      const [x5, y5] = at(5);
      tl.to(q(r, '.st-eq.up'), { opacity: 0.4, duration: 0.4 }, 0);
      tl.to(q(r, '.st-hop.up'), { opacity: 0.3, duration: 0.4 }, 0);
      tl.to(tok, { autoAlpha: 0, duration: 0.2 }, 0);
      tl.set(tok, { autoAlpha: 1 }, 0.35);
      along(tl, tok, [x5, y5 - 5], [x5, y5 - 5], [x5, y5], 0.35, 0.6, 'bounce.out');
      pop(tl, q(r, '.st-eq.down'), 0.6);
      const [a, b] = hops.down;
      const downs = qa(r, '.st-hop.down');
      along(tl, tok, a.from, a.via, a.to, 1.2, 0.7);
      draw(tl, downs[0], 1.2, { duration: 0.7, ease: 'power1.inOut' });
      along(tl, tok, b.from, b.via, b.to, 2.05, 0.7);
      draw(tl, downs[1], 2.05, { duration: 0.7, ease: 'power1.inOut' });
    },
  ]);
}

/* ---------- compose: five counters split into two parts ----------
   viz.<data> = { title, rows: ['Predmet', 'Raqam', 'Ifoda'] }
   phase 0: five counters.  phase 1: they split 2 | 3, the numbers and 2 + 3 = 5 follow.
   phase 2: they regroup 1 | 4, and 1 + 4 = 5. Each part takes its number's colour. */
function compose(host, data) {
  const W = words(data);
  const [l1, l2, l3] = W.rows || [];
  const split = (a) => ({ slot: (k) => (k < a ? k : k + 1), mid: [(a - 1) / 2, a + 1 + (5 - a - 1) / 2] });
  const expr = (a, b) => `<span class="d${a}">${a}</span> + <span class="d${b}">${b}</span> = <span class="d5">5</span>`;
  // A number under its group: where it sits (in cube slots), what it says, and its colour.
  const setNum = (el, m, v, side) => {
    if (!el) return;
    el.style.setProperty('--m', m);
    el.textContent = String(v);
    el.className = `cp-num ${side} d${v}`;
  };
  return viz(host, `
  <div class="viz viz-compose sheet">
    <header class="cp-hd"><span class="cp-five">5</span><b>${W.title || ''}</b></header>
    <div class="cp-body">
      <span class="cp-lab n1"><i>1</i>${l1 || ''}</span>
      <div class="cp-cubes">${[0, 1, 2, 3, 4].map((k) => `<span class="cube n5" style="--s:${k}"></span>`).join('')}</div>
      <span class="cp-lab n2"><i>2</i>${l2 || ''}</span>
      <div class="cp-nums"><b class="cp-num a" style="--m:0.5">2</b><b class="cp-num b" style="--m:4">3</b></div>
      <span class="cp-lab n3"><i>3</i>${l3 || ''}</span>
      <div class="cp-expr"><span class="cp-e e1 math">${expr(2, 3)}</span><span class="cp-e e2 math">${expr(1, 4)}</span></div>
    </div>
    <footer class="cp-done">
      <span class="chip c1">${icon('check')}<span class="math">5 = 2 + 3</span></span>
      <span class="chip c2">${icon('check')}<span class="math">5 = 1 + 4</span></span>
    </footer>
  </div>`, [
    (r, tl) => {
      pop(tl, qa(r, '.cp-lab'), 0.05, { stagger: 0.1 });
      popIn(tl, qa(r, '.cube'), 0.3, 0.1);
    },
    (r, tl) => {
      const s = split(2);
      const cubes = qa(r, '.cube');
      cubes.forEach((c, k) => tl.to(c, { '--s': s.slot(k), duration: 0.8, ease: 'power3.inOut' }, 0.2));
      tl.call(() => cubes.forEach((c, k) => { c.classList.remove('n1', 'n2', 'n3', 'n4', 'n5'); c.classList.add(k < 2 ? 'n2' : 'n3'); }), null, 0.55);
      tl.call(() => { setNum(q(r, '.cp-num.a'), s.mid[0], 2, 'a'); setNum(q(r, '.cp-num.b'), s.mid[1], 3, 'b'); }, null, 0.9);
      pop(tl, qa(r, '.cp-num'), 1.0, { stagger: 0.14 });
      pop(tl, q(r, '.cp-e.e1'), 1.55);
      pop(tl, q(r, '.chip.c1'), 2.1);
    },
    (r, tl) => {
      const s = split(1);
      const cubes = qa(r, '.cube');
      tl.to(qa(r, '.cp-num, .cp-e.e1'), { autoAlpha: 0, duration: 0.3 }, 0);
      cubes.forEach((c, k) => tl.to(c, { '--s': s.slot(k), duration: 0.8, ease: 'power3.inOut' }, 0.25));
      tl.call(() => cubes.forEach((c, k) => { c.classList.remove('n1', 'n2', 'n3', 'n4', 'n5'); c.classList.add(k < 1 ? 'n1' : 'n4'); }), null, 0.6);
      tl.call(() => { setNum(q(r, '.cp-num.a'), s.mid[0], 1, 'a'); setNum(q(r, '.cp-num.b'), s.mid[1], 4, 'b'); }, null, 0.95);
      pop(tl, qa(r, '.cp-num'), 1.05, { stagger: 0.14 });
      pop(tl, q(r, '.cp-e.e2'), 1.6);
      pop(tl, q(r, '.chip.c2'), 2.15);
    },
  ]);
}

/* ---------- train: a locomotive "5" and wagons with sums ----------
   viz.<data> = { loco, wagons: ['2 + 3', ...], results: [5, ...] }
   phase 0: the locomotive on the main line, the wagons waiting on the siding above.
   phase 1: each wagon shows its result; those that make 5 couple to the locomotive. */
function train(host, data) {
  const W = words(data);
  const wagons = W.wagons || [];
  const results = W.results || [];
  const sidingX = (k) => 1.4 + k * 8.9;
  const SIDE_Y = 4;
  const MAIN_Y = 17.4;
  const coupled = [11.4, 19.7];
  const rail = (y) => `
    <path class="tr-rail" d="M0.4 ${y} L45.6 ${y}"/>
    ${Array.from({ length: 31 }, (_, i) => `<path class="tr-sleeper" d="M${(0.9 + i * 1.5).toFixed(2)} ${y} L${(0.9 + i * 1.5).toFixed(2)} ${(y + 0.8).toFixed(2)}"/>`).join('')}`;
  return viz(host, `
  <div class="viz viz-train">
    <svg class="tr-svg" viewBox="0 0 46 25" aria-hidden="true">
      ${rail(9.82)}
      ${rail(23.2)}
      <g class="tr-loco">
        <rect class="b" x="1.7" y="12.6" width="2.2" height="0.7" rx="0.2"/>
        <rect class="b" x="2" y="13" width="1.6" height="2.8"/>
        <rect class="b" x="6.8" y="12.3" width="3.8" height="3.7" rx="0.4"/>
        <rect class="b" x="0.8" y="15.6" width="9.8" height="6" rx="0.8"/>
        <rect class="b" x="0.2" y="19.3" width="0.8" height="1"/>
        <circle class="win" cx="8.7" cy="14.1" r="0.8"/>
        <circle class="five" cx="5" cy="18.6" r="2.05"/>
        <text x="5" y="19.55" text-anchor="middle" font-size="2.7">5</text>
        <circle class="wh" cx="3" cy="22.25" r="0.95"/><circle class="wh" cx="8.4" cy="22.25" r="0.95"/>
      </g>
      <text class="tr-cap" x="5.6" y="24.8" text-anchor="middle" font-size="0.78">${W.loco || ''}</text>
      <path class="tr-link l1" d="M10.6 20.2 L11.4 20.2"/>
      <path class="tr-link l2" d="M18.8 20.2 L19.7 20.2"/>
      ${wagons.map((w, k) => `
        <g class="tr-w" data-k="${k}" data-ok="${results[k] === 5 ? 1 : 0}" transform="translate(${sidingX(k).toFixed(2)} ${SIDE_Y})">
          <rect class="tr-body" x="0" y="0" width="7.4" height="4.6" rx="0.7"/>
          <circle class="wh" cx="1.7" cy="5.2" r="0.62"/><circle class="wh" cx="5.7" cy="5.2" r="0.62"/>
          <text class="tr-sum" x="3.7" y="3.05" text-anchor="middle" font-size="1.7">${w}</text>
          <g class="tr-badge n${results[k] || 1}"><circle cx="3.7" cy="-1.9" r="1.25"/><text x="3.7" y="-1.4" text-anchor="middle" font-size="1.35">${results[k] ?? ''}</text></g>
        </g>`).join('')}
    </svg>
  </div>`, [
    (r, tl) => {
      tl.fromTo(q(r, '.tr-loco'), { autoAlpha: 0, x: -4 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0);
      tl.fromTo(qa(r, '.tr-w'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, stagger: 0.1 }, 0.3);
    },
    (r, tl) => {
      const svg = q(r, '.tr-svg');
      const ws = qa(r, '.tr-w');
      const svgPop = { transformOrigin: '50% 50%', smoothOrigin: false };
      ws.forEach((w, k) => tl.fromTo(q(w, '.tr-badge'), { autoAlpha: 0, scale: 0.3, ...svgPop }, { autoAlpha: 1, scale: 1, ...svgPop, duration: 0.5, ease: 'back.out(2.4)' }, 0.15 + k * 0.32));
      const good = ws.filter((w) => w.dataset.ok === '1');
      const bad = ws.filter((w) => w.dataset.ok !== '1');
      tl.to(bad, { opacity: 0.32, duration: 0.5 }, 1.9);
      tl.call(() => good.forEach((w) => svg.appendChild(w)), null, 1.95);
      good.forEach((w, i) => {
        const x0 = sidingX(Number(w.dataset.k));
        const x1 = coupled[i] ?? coupled[coupled.length - 1];
        const lift = SIDE_Y - 3.6;
        along(tl, w, [x0, SIDE_Y], [x0, lift], [x0 + (x1 - x0) * 0.35, lift], 2.0 + i * 0.12, 0.5, 'power2.out');
        along(tl, w, [x0 + (x1 - x0) * 0.35, lift], [x1, lift], [x1, lift], 2.5 + i * 0.12, 0.55, 'power2.inOut');
        along(tl, w, [x1, lift], [x1, lift], [x1, MAIN_Y], 3.1 + i * 0.12, 0.6, 'power2.in');
        tl.call(() => w.classList.add('on'), null, 3.45 + i * 0.12);
      });
      tl.fromTo(qa(r, '.tr-link'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.1 }, 3.85);
    },
  ]);
}

/* ---------- worksheet: the pupil's card, filled in by hand ----------
   viz.<data> = { title, tasks: [3 lines], star, watch, skills: [4], next }
   phase 0: the blank card and the teacher's list.  phase 1: the answers are written in, and each
   ticks its skill.  phase 2: the open task for a strong pupil lights up and two examples are written. */
function worksheet(host, data) {
  const W = words(data);
  const [t1, t2, t3] = W.tasks || [];
  const skills = W.skills || [];
  const blank = (v, k) => `<span class="ws-blank" data-w="${k}">${hand(v, { ink: true, seed: k + 5 })}</span>`;
  return viz(host, `
  <div class="viz viz-ws">
    <article class="ws-paper">
      <span class="ws-chip">${W.title || ''}</span>
      <div class="ws-task n1"><span class="ws-k">1</span><span class="ws-q">${t1 || ''}</span>
        <span class="ws-a math">1, 2, ${blank('3', 0)}, 4, 5</span></div>
      <div class="ws-task n2"><span class="ws-k">2</span><span class="ws-q">${t2 || ''}</span>
        <span class="ws-a"><span class="ws-ex math">3 + 1 = ${blank('4', 1)}</span><span class="ws-ex math">5 − 2 = ${blank('3', 2)}</span></span></div>
      <div class="ws-task n3"><span class="ws-k">3</span><span class="ws-q">${t3 || ''}</span>
        <span class="ws-a math">5 = ${blank('2', 3)} + ${blank('3', 4)}</span></div>
      <div class="ws-star">
        <span class="ws-star-ic">${icon('star')}</span><span class="ws-star-t">${W.star || ''}</span>
        <span class="ws-extra">${hand('1 + 4 = 5', { ink: true, seed: 11 })}${hand('3 + 2 = 5', { ink: true, seed: 13 })}</span>
      </div>
    </article>
    <aside class="ws-watch">
      <b>${W.watch || ''}</b>
      <ul>${skills.map((s, k) => `<li class="${nth(k)}"><span class="ws-tick">${icon('check')}</span>${s}</li>`).join('')}</ul>
      <p>${W.next || ''}</p>
    </aside>
  </div>`, [
    (r, tl) => {
      tl.fromTo(q(r, '.ws-paper'), { autoAlpha: 0, y: 24, rotation: -2 }, { autoAlpha: 1, y: 0, rotation: -0.6, duration: 0.9, ease: 'expo.out' }, 0);
      pop(tl, qa(r, '.ws-task, .ws-star'), 0.3, { stagger: 0.09 });
      tl.fromTo(q(r, '.ws-watch'), { autoAlpha: 0, x: 18 }, { autoAlpha: 1, x: 0, duration: 0.8, ease: 'expo.out' }, 0.5);
    },
    (r, tl) => {
      const svg = (k) => q(r, `.ws-blank[data-w="${k}"] .hand`);
      const items = qa(r, '.ws-watch li');
      const tick = (li, when) => tl.call(() => li?.classList.add('done'), null, when);
      writeIn(tl, svg(0), 0.2);
      tick(items[0], 0.75);
      writeIn(tl, svg(1), 1.05);
      tick(items[1], 1.6);
      writeIn(tl, svg(2), 1.9);
      tick(items[2], 2.45);
      writeIn(tl, svg(3), 2.75);
      writeIn(tl, svg(4), 3.25);
      tick(items[3], 3.8);
    },
    (r, tl) => {
      tl.call(() => q(r, '.ws-star')?.classList.add('on'), null, 0.1);
      const ex = qa(r, '.ws-extra .hand');
      writeIn(tl, ex[0], 0.5, 0.2);
      writeIn(tl, ex[1], 1.9, 0.2);
    },
  ]);
}

/* ---------- traffic: the pupil's traffic light ----------
   viz.<data> = { title, lamps: [['ok' | 'warn' | 'bad', text]] }
   phase 0: the light, then each lamp lights with its words. */
function traffic(host, data) {
  const W = words(data);
  const lamps = W.lamps || [];
  return viz(host, `
  <div class="viz viz-light">
    <div class="tl-box">
      <b class="tl-title">${W.title || ''}</b>
      ${lamps.map(([tone, text]) => `<div class="tl-row ${tone}"><span class="tl-lamp"><i></i></span><span class="tl-text">${text}</span></div>`).join('')}
    </div>
  </div>`, [
    (r, tl) => {
      tl.fromTo(q(r, '.tl-box'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0);
      qa(r, '.tl-row').forEach((row, k) => tl.call(() => row.classList.add('on'), null, 0.7 + k * 0.6));
    },
  ]);
}

/* ---------- timebar: the lesson's minutes, each part as wide as its time ----------
   viz.<data> = { unit, rows: [{ label, total, parts: [[minutes, name]] }] }
   phase 0: the 45-minute lesson, part by part.  phase 1: the 12-minute micro-lesson below it. */
function timebar(host, data) {
  const W = words(data);
  const [a, b] = W.rows || [];
  const unit = W.unit || '';
  const total = (row) => row.parts.reduce((s, [m]) => s + m, 0);
  let t = 0;
  const A = a ? `
    <div class="tb-row tb-a">
      <p class="tb-cap"><b>${a.label}</b><span>${a.total}</span></p>
      <div class="tb-bar">
        ${a.parts.map(([m, name], k) => `
          <div class="tb-seg ${nth(k)}" style="flex:${m}">
            <i class="tb-fill"></i>
            <span class="tb-min"><b class="ctr" data-v="${m}">0</b> ${unit}</span>
            <span class="tb-name">${name}</span>
          </div>`).join('')}
      </div>
      <div class="tb-ticks">${[0, ...a.parts.map(([m]) => (t += m))].map((v) => `<span style="left:${((v / total(a)) * 100).toFixed(3)}%">${v}</span>`).join('')}</div>
    </div>` : '';
  let u = 0;
  const B = b ? `
    <div class="tb-row tb-b">
      <p class="tb-cap"><b>${b.label}</b><span>${b.total}</span></p>
      <div class="tb-bar thin">
        ${b.parts.map(([m, name], k) => {
          const from = u;
          u += m;
          return `
          <div class="tb-seg ${nth(k)}" style="flex:${m}">
            <i class="tb-line"></i>
            <span class="tb-range mono">${from}–${u} ${unit}</span>
            <span class="tb-name">${name}</span>
          </div>`;
        }).join('')}
      </div>
    </div>` : '';
  return viz(host, `<div class="viz viz-time">${A}${B}</div>`, [
    (r, tl) => {
      const row = q(r, '.tb-a');
      if (!row) return;
      pop(tl, q(row, '.tb-cap'), 0);
      qa(row, '.tb-seg').forEach((seg, k) => {
        const at = 0.15 + k * 0.26;
        tl.fromTo(q(seg, '.tb-fill'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, at);
        tl.fromTo(qa(seg, '.tb-min, .tb-name'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, at + 0.4);
        const c = q(seg, '.ctr');
        countUp(tl, c, Number(c.dataset.v), at + 0.25, { duration: 0.8 });
      });
      tl.fromTo(qa(row, '.tb-ticks span'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, stagger: 0.05 }, 1.3);
    },
    (r, tl) => {
      const row = q(r, '.tb-b');
      if (!row) return;
      tl.to(q(r, '.tb-a'), { opacity: 0.4, duration: 0.6 }, 0);
      tl.fromTo(row, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.1);
      qa(row, '.tb-seg').forEach((seg, k) => {
        const at = 0.4 + k * 0.22;
        tl.fromTo(q(seg, '.tb-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power3.out' }, at);
        tl.fromTo(qa(seg, '.tb-range, .tb-name'), { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' }, at + 0.15);
      });
    },
  ]);
}

/* ---------- stages: a line of stations, each a coloured number (fits the 'top' layout) ----------
   viz.<data> = { items: [{ title, text, figure }] }
   phase 0: the line draws and the stations appear.  phase 1: each station's figure appears. */
function stages(host, data) {
  const W = words(data);
  const items = W.items || [];
  return viz(host, `
  <div class="viz viz-stages" style="--n:${items.length}">
    <i class="stg-line"></i>
    <ol class="stg-list">
      ${items.map((it, k) => `
        <li class="stg ${nth(k)}">
          <span class="stg-dot"><b>${k + 1}</b></span>
          <b class="stg-t1">${it.title}</b>
          ${it.text ? `<span class="stg-t">${it.text}</span>` : ''}
          ${it.figure ? `<span class="stg-f">${it.figure}</span>` : ''}
        </li>`).join('')}
    </ol>
  </div>`, [
    (r, tl) => {
      tl.fromTo(q(r, '.stg-line'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
      qa(r, '.stg').forEach((li, k) => {
        const at = 0.1 + (k / Math.max(1, items.length - 1)) * 1.3;
        popIn(tl, q(li, '.stg-dot'), at);
        pop(tl, qa(li, '.stg-t1, .stg-t'), at + 0.1, { stagger: 0.06 });
      });
    },
    (r, tl) => {
      tl.call(() => r.classList.add('lit'));
      tl.fromTo(qa(r, '.stg-f'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.14 });
    },
  ]);
}

/* ---------- flow: a chain of nodes, lit one per phase, each in its number's colour ----------
   viz.<data> = { nodes: [{ icon, title, text }] }
   phase 0: the chain appears and the first node lights.  phase k: node k lights. */
function flow(host, data) {
  const W = words(data);
  const nodes = W.nodes || [];
  return viz(host, `
  <div class="viz viz-flow">
    ${nodes.map((nd, k) => `
      ${k ? '<i class="fl-link"><i class="fl-fill"></i></i>' : ''}
      <div class="fl-node ${nth(k)}">
        <span class="fl-ic">${icon(nd.icon || 'circle')}</span>
        <span class="fl-tx"><b>${nd.title}</b>${nd.text ? `<span>${nd.text}</span>` : ''}</span>
      </div>`).join('')}
  </div>`, nodes.map((_, k) => (r, tl) => {
    const node = qa(r, '.fl-node')[k];
    if (k === 0) pop(tl, qa(r, '.fl-node, .fl-link'), 0, { stagger: 0.07 });
    else tl.fromTo(qa(r, '.fl-fill')[k - 1], { scaleY: 0 }, { scaleY: 1, duration: 0.45, ease: 'power2.inOut' });
    tl.call(() => node.classList.add('lit'), null, k === 0 ? 0.5 : '>');
    tl.fromTo(q(node, '.fl-ic'), { scale: 0.7 }, { scale: 1, duration: 0.5, ease: 'back.out(2.4)' }, '<');
  }));
}

/* ---------- checklist: a list of items, ticked off ----------
   viz.<data> = { title, sub, items: ['...'], result }
   phase 0: the list appears, nothing ticked.  phase 1: every item is ticked, then the result. */
function checklist(host, data) {
  const W = words(data);
  const items = W.items || [];
  return viz(host, `
  <div class="viz viz-check sheet">
    <header class="sheet-hd">
      ${icon('listChecks')}
      <span class="sh-t"><b>${W.title || ''}</b>${W.sub ? `<span>${W.sub}</span>` : ''}</span>
    </header>
    <ul class="ck-list">
      ${items.map((it, k) => `<li class="${nth(k)}"><span class="ck-box">${icon('check')}</span><span>${it}</span></li>`).join('')}
    </ul>
    ${W.result ? `<footer class="ck-foot"><span class="chip ok ck-res">${W.result}</span></footer>` : ''}
  </div>`, [
    (r, tl) => {
      pop(tl, qa(r, '.ck-list li'), 0.1, { stagger: 0.07 });
    },
    (r, tl) => {
      qa(r, '.ck-list li').forEach((li, k) => {
        tl.call(() => li.classList.add('done'), null, 0.2 + k * 0.34);
        tl.fromTo(q(li, '.ck-box .ic'), { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 0.2 + k * 0.34);
      });
      if (q(r, '.ck-res')) pop(tl, q(r, '.ck-res'), '>+0.2');
    },
  ]);
}

export const VISUALS = {
  balls, sort, missing, stairs, compose, train, worksheet, traffic, timebar, stages, flow, checklist,
};
