export function alert(message, title = 'Avviso') {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay open';
    ov.innerHTML = `
      <div class="modal" role="dialog">
        <h3>${title}</h3>
        <p style="color:var(--text-2);margin:8px 0 16px">${message}</p>
        <button class="btn btn-primary btn-block">OK</button>
      </div>`;
    document.body.appendChild(ov);
    ov.querySelector('button').addEventListener('click', () => { ov.remove(); resolve(true); });
  });
}

export function confirm(message, title = 'Conferma') {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay open';
    ov.innerHTML = `
      <div class="modal" role="dialog">
        <h3>${title}</h3>
        <p style="color:var(--text-2);margin:8px 0 16px">${message}</p>
        <div class="btn-row">
          <button class="btn btn-secondary" data-act="no">Annulla</button>
          <button class="btn btn-primary" data-act="yes">Conferma</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t) return;
      ov.remove();
      resolve(t.dataset.act === 'yes');
    });
  });
}

export function prompt(message, defaultValue = '', title = 'Input') {
  return new Promise((resolve) => {
    const ov = document.createElement('div');
    ov.className = 'modal-overlay open';
    ov.innerHTML = `
      <div class="modal" role="dialog">
        <h3>${title}</h3>
        <p style="color:var(--text-2);margin:8px 0 12px">${message}</p>
        <input class="input" type="text" value="${(defaultValue || '').replace(/"/g,'&quot;')}">
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-secondary" data-act="no">Annulla</button>
          <button class="btn btn-primary" data-act="yes">OK</button>
        </div>
      </div>`;
    document.body.appendChild(ov);
    const input = ov.querySelector('input');
    input.focus(); input.select();
    ov.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t) return;
      const val = input.value;
      ov.remove();
      resolve(t.dataset.act === 'yes' ? val : null);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const v = input.value;
        ov.remove();
        resolve(v);
      }
    });
  });
}
