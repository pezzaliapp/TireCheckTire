// Pad firma cliente: canvas con eventi pointer/touch
export function attach(canvas) {
  if (!canvas) return null;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let hasDrawn = false;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, r.width, r.height);
    ctx.strokeStyle = '#0a0a0a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  resize();

  const pos = (e) => {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };

  const start = (e) => { e.preventDefault(); drawing = true; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
  const move = (e) => { if (!drawing) return; e.preventDefault(); const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); hasDrawn = true; };
  const end = () => { drawing = false; };

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  return {
    clear() {
      const r = canvas.getBoundingClientRect();
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, r.width, r.height);
      hasDrawn = false;
    },
    isEmpty() { return !hasDrawn; },
    dataURL() { return canvas.toDataURL('image/png'); },
  };
}
