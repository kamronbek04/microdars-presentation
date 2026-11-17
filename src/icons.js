// Lucide icons as inline SVG strings, one stroke weight across the deck. Use them by the short
// name on the left: icon('eye'). To add one, find it on lucide.dev, import it and list it here.
import {
  ArrowLeft, ArrowRight, Check, CheckCheck, Circle, Eye, Hand, ListChecks, MessageCircle, Mic, Moon, Pointer, Star, Sun,
  Target,
} from 'lucide';

const SET = {
  arrowLeft: ArrowLeft, arrowRight: ArrowRight, check: Check, checkCheck: CheckCheck, circle: Circle, eye: Eye, hand: Hand,
  listChecks: ListChecks, messageCircle: MessageCircle, mic: Mic, moon: Moon, pointer: Pointer, star: Star,
  sun: Sun, target: Target,
};

const ATTRS = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

export function icon(name, cls = '') {
  let node = SET[name];
  if (!node) {
    if (import.meta.env.DEV) console.warn(`[icons] unknown icon "${name}": add it to src/icons.js`);
    node = Circle;
  }
  const inner = node.map(([tag, attrs]) => `<${tag}${Object.entries(attrs).map(([k, v]) => ` ${k}="${v}"`).join('')}/>`).join('');
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" ${ATTRS} aria-hidden="true">${inner}</svg>`;
}
