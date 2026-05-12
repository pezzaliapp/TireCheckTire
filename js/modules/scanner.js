// Scanner fotocamera: BarcodeDetector nativo + fallback jsQR
import { parseQRPayload } from './tire-parser.js';
import { toast } from '../ui/toast.js';
import { loadScript } from '../core/utils.js';

let state = {
  stream: null,
  active: false,
  detector: null,
  onResult: null,
};

let dom = null;

function ensureOverlay() {
  if (dom) return dom;
  const ov = document.createElement('div');
  ov.className = 'scanner-overlay';
  ov.id = 'scanner-overlay';
  ov.innerHTML = `
    <div class="scanner-top">
      <button class="scanner-btn" id="scanner-close" aria-label="Chiudi">✕</button>
      <div class="scanner-status" id="scanner-status">Avvio fotocamera...</div>
      <button class="scanner-btn hidden" id="scanner-flash" aria-label="Torcia">🔦</button>
    </div>
    <video id="scanner-video" playsinline muted></video>
    <canvas id="scanner-canvas"></canvas>
    <div class="scanner-frame"></div>
    <div class="scanner-bottom">
      <div class="scanner-status">Inquadra QR · EAN · DOT</div>
    </div>
  `;
  document.body.appendChild(ov);
  dom = {
    overlay: ov,
    video: ov.querySelector('#scanner-video'),
    canvas: ov.querySelector('#scanner-canvas'),
    status: ov.querySelector('#scanner-status'),
    flash: ov.querySelector('#scanner-flash'),
  };
  ov.querySelector('#scanner-close').addEventListener('click', () => close());
  dom.flash.addEventListener('click', () => toggleTorch());
  return dom;
}

export async function open(onResult) {
  const d = ensureOverlay();
  state.onResult = onResult;
  d.overlay.classList.add('open');
  d.status.textContent = 'Avvio fotocamera...';

  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    d.video.srcObject = state.stream;
    await d.video.play();

    // torcia
    const track = state.stream.getVideoTracks()[0];
    const caps = track.getCapabilities ? track.getCapabilities() : {};
    if (caps.torch) d.flash.classList.remove('hidden'); else d.flash.classList.add('hidden');

    d.status.textContent = 'Inquadra QR · EAN · DOT';
    state.active = true;

    if ('BarcodeDetector' in window) {
      try {
        state.detector = new BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'data_matrix'],
        });
        loopNative();
        return;
      } catch (e) { console.warn('BarcodeDetector init failed', e); }
    }

    // fallback jsQR
    try { await loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js'); }
    catch (e) { toast('Scanner non disponibile su questo browser', 'warn'); return; }
    loopJsQR();

  } catch (e) {
    d.status.textContent = 'Permesso fotocamera negato';
    toast('⚠ Impossibile accedere alla fotocamera', 'error');
    console.error(e);
  }
}

async function loopNative() {
  if (!state.active) return;
  try {
    const codes = await state.detector.detect(dom.video);
    if (codes && codes.length) return handleResult(codes[0].rawValue, codes[0].format);
  } catch (_) {}
  requestAnimationFrame(loopNative);
}

function loopJsQR() {
  if (!state.active) return;
  if (typeof window.jsQR === 'undefined') return setTimeout(loopJsQR, 200);
  if (dom.video.videoWidth) {
    dom.canvas.width = dom.video.videoWidth;
    dom.canvas.height = dom.video.videoHeight;
    const ctx = dom.canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(dom.video, 0, 0, dom.canvas.width, dom.canvas.height);
    const img = ctx.getImageData(0, 0, dom.canvas.width, dom.canvas.height);
    const code = window.jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
    if (code) return handleResult(code.data, 'qr_code');
  }
  requestAnimationFrame(loopJsQR);
}

function handleResult(raw, format) {
  if (!state.active) return;
  state.active = false;
  if (navigator.vibrate) navigator.vibrate(60);
  const flash = document.createElement('div');
  flash.className = 'scanner-success-flash';
  dom.overlay.appendChild(flash);
  setTimeout(() => flash.remove(), 400);

  const parsed = parseQRPayload(raw);
  close();
  if (state.onResult) state.onResult({ ...parsed, format });
}

export function close() {
  if (state.stream) {
    state.stream.getTracks().forEach(t => t.stop());
    state.stream = null;
  }
  state.active = false;
  if (dom) dom.overlay.classList.remove('open');
}

async function toggleTorch() {
  if (!state.stream) return;
  const track = state.stream.getVideoTracks()[0];
  const caps = track.getCapabilities ? track.getCapabilities() : {};
  if (!caps.torch) return;
  const settings = track.getSettings();
  try { await track.applyConstraints({ advanced: [{ torch: !settings.torch }] }); }
  catch (e) { console.warn('Torch toggle failed', e); }
}
