// The progress rail docked at the bottom: the stations of the story (stages, modules, chapters).
// Stations and optional groups come from rail: { ... } in the language files; a step lights one
// station with rail: 3 in steps.js, or every station with rail: 'done'. No rail key hides it.
import { T } from './i18n.js';
import { icon } from './icons.js';

export function createRail(el) {
  let stations = [];
  let fill = null;
  let n = 0;
  let last;

  // Stations sit evenly from 3% to 97% of the width; a group label sits over its first station.
  const x = (k) => (n > 1 ? 3 + (k * 94) / (n - 1) : 50);

  function render() {
    const R = T().rail || {};
    const names = R.stations || [];
    n = names.length;
    let k0 = 0;
    const groups = (R.groups || []).map((g) => {
      const from = k0;
      k0 += g.size;
      return { name: g.name, from, to: k0 - 1 };
    });
    el.setAttribute('aria-label', R.label || '');
    el.innerHTML = `
      ${groups.map((g) => `<span class="rail-grp" style="left:${x(g.from)}%;width:${x(g.to) - x(g.from)}%"><span>${g.name}</span></span>`).join('')}
      <div class="rail-track" style="left:${x(0)}%;right:${100 - x(n - 1)}%"><div class="rail-fill"></div></div>
      ${names.map((name, k) => `
        <div class="rail-st" style="left:${x(k)}%">
          <span class="dot">${icon('check', 'ck')}</span>
          <span class="lb"><span class="n mono">${k + 1}</span>${name}</span>
        </div>`).join('')}`;
    fill = el.querySelector('.rail-fill');
    stations = [...el.querySelectorAll('.rail-st')];
  }

  function set(spec) {
    last = spec;
    const show = spec !== undefined && spec !== null && spec !== false && n > 0;
    el.classList.toggle('on', show);
    if (!show) return;
    const all = spec === 'done';
    const at = all ? n : Number(spec);
    stations.forEach((st, k) => {
      st.classList.toggle('done', k < at - 1 || all);
      st.classList.toggle('now', k === at - 1 && !all);
      st.toggleAttribute('aria-current', k === at - 1);
    });
    fill.style.width = `${n > 1 ? (Math.max(0, Math.min(n, at) - 1) / (n - 1)) * 100 : 100}%`;
  }

  render();
  return {
    set,
    // Re-render in the current language, keeping the state without replaying the fill.
    relocalize() {
      render();
      fill.style.transition = 'none';
      set(last);
      requestAnimationFrame(() => { fill.style.transition = ''; });
    },
  };
}
