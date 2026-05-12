import { go, current } from '../core/router.js';
import { on } from '../core/events.js';

// The 5 nav buttons are pre-rendered as anchors in index.html (so they're
// visible/navigable even before the JS module finishes loading). mount()
// upgrades the anchors to SPA links and tracks the active tab.
export function mount() {
  const el = document.getElementById('bottom-nav');
  if (!el) return;

  el.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const screen = btn.dataset.screen;
      if (screen) go(screen);
    });
  });

  highlight(current());
  on('screen:changed', ({ name }) => highlight(name));
}

function highlight(screenName) {
  const el = document.getElementById('bottom-nav');
  if (!el) return;
  el.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screenName);
  });
}
