import { emit } from './events.js';
import { state } from './state.js';

const screens = new Map();
let suppressHashChange = false;

export function register(name, mount) {
  screens.set(name, mount);
}

export function go(name, params = {}) {
  if (!screens.has(name)) {
    console.warn('Unknown screen:', name);
    return;
  }
  state.currentScreen = name;
  const newHash = name + (params && Object.keys(params).length ? '?' + new URLSearchParams(params).toString() : '');
  // Hash assignment fires `hashchange`; suppress the duplicate render that would follow.
  suppressHashChange = true;
  window.location.hash = newHash;
  render(name, params);
}

function render(name, params) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + name);
  if (el) el.classList.add('active');

  const mount = screens.get(name);
  if (mount) {
    try { mount(params); } catch (e) { console.error('Screen mount error', name, e); }
  }
  emit('screen:changed', { name, params });
  window.scrollTo({ top: 0, behavior: 'instant' });
}

export function init(defaultScreen = 'dashboard') {
  const parse = () => {
    const h = window.location.hash.replace(/^#/, '');
    if (!h) return { name: defaultScreen, params: {} };
    const [name, qs] = h.split('?');
    const params = {};
    if (qs) new URLSearchParams(qs).forEach((v, k) => { params[k] = v; });
    return { name: screens.has(name) ? name : defaultScreen, params };
  };

  const { name, params } = parse();
  state.currentScreen = name;
  render(name, params);

  window.addEventListener('hashchange', () => {
    if (suppressHashChange) { suppressHashChange = false; return; }
    const { name, params } = parse();
    state.currentScreen = name;
    render(name, params);
  });
}

export function current() {
  return state.currentScreen;
}
