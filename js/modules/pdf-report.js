// PDF report di analisi (auto + truck) — riadattato da TireCheck Pro
import { loadScript } from '../core/utils.js';
import { state } from '../core/state.js';
import { PDF_DISCLAIMER } from '../data/legal.js';

const JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

async function ensureJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await loadScript(JSPDF_CDN);
  return window.jspdf.jsPDF;
}

export async function generate(r) {
  const jsPDF = await ensureJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const W = 210, M = 14;
  let y = 14;

  // header
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 0, W, 28, 'F');
  doc.setTextColor(232, 255, 71);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TireCheckTire', M, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text('Tire Intelligence Suite · by PezzaliApp', M, 16);

  const officina = state.settings.officina || 'Officina';
  const tel = state.settings.tel || '';
  const addr = state.settings.addr || '';
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(officina, W - M, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  if (tel)  doc.text(tel,  W - M, 15, { align: 'right' });
  if (addr) doc.text(addr, W - M, 20, { align: 'right' });

  y = 36;

  doc.setTextColor(240, 240, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const title = r.mode === 'truck' ? 'Report Analisi Pneumatico — Truck/Fleet' : 'Report Analisi Pneumatico — Auto';
  doc.text(title, M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text(new Date(r.timestamp || Date.now()).toLocaleString('it-IT'), M, y);
  y += 8;

  // veicolo
  doc.setFillColor(26, 26, 26);
  doc.roundedRect(M, y, W - M * 2, 20, 3, 3, 'F');
  doc.setTextColor(232, 255, 71);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('VEICOLO', M + 4, y + 5);
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(10);
  doc.text(String(r.targa || 'N/D'), M + 4, y + 11);
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  const veicInfo = (r.mode === 'truck')
    ? [r.tipo_mezzo, r.tipo_asse, r.posizione, r.lato, r.montaggio, r.marca_veicolo, r.cliente].filter(Boolean).join(' · ')
    : [r.posizione, r.marca_veicolo, r.cliente].filter(Boolean).join(' · ');
  doc.text(veicInfo, M + 4, y + 17);
  y += 26;

  // pneumatico
  doc.setFillColor(26, 26, 26);
  doc.roundedRect(M, y, W - M * 2, 22, 3, 3, 'F');
  doc.setTextColor(232, 255, 71);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PNEUMATICO', M + 4, y + 5);
  doc.setTextColor(240, 240, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const tireRow = [r.marca || r.marca_gomma, r.misura].filter(Boolean).join(' — ') || 'N/D';
  doc.text(tireRow, M + 4, y + 11);
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  const dotRow = [
    r.dot ? `DOT: ${r.dot}` : '',
    r.anno_produzione ? `Anno: ${r.anno_produzione}` : '',
    r.km_mezzo ? `km: ${r.km_mezzo}` : '',
    r.pressione_bar ? `${r.pressione_bar} bar` : '',
  ].filter(Boolean).join('  ·  ');
  if (dotRow) doc.text(dotRow, M + 4, y + 18);
  y += 28;

  // esito
  const esitoColor = r.esito === 'OK' ? [46, 213, 115] : r.esito === 'ATTENZIONE' ? [255, 165, 2] : [255, 71, 87];
  doc.setFillColor(esitoColor[0], esitoColor[1], esitoColor[2]);
  doc.setGState(new doc.GState({ opacity: 0.18 }));
  doc.roundedRect(M, y, W - M * 2, 14, 3, 3, 'F');
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.setTextColor(esitoColor[0], esitoColor[1], esitoColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ESITO: ${r.esito} · urgenza ${r.urgenza || 'media'}`, M + 4, y + 9);
  y += 20;

  // metriche
  const cols = [
    ['Profondità', r.profondita_mm != null ? `${r.profondita_mm} mm` : '—'],
    ['Usura',      r.tipo_usura || '—'],
    ['Fianco',     r.condizione_fianco || '—'],
    ['Urgenza',    r.urgenza || '—'],
  ];
  const cw = (W - M * 2 - 9) / 4;
  cols.forEach(([label, val], i) => {
    const x = M + i * (cw + 3);
    doc.setFillColor(26, 26, 26);
    doc.roundedRect(x, y, cw, 18, 2, 2, 'F');
    doc.setTextColor(136, 136, 136);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(label.toUpperCase(), x + 3, y + 5);
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(String(val), x + 3, y + 13);
  });
  y += 24;

  // commento
  doc.setTextColor(136, 136, 136);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const commentLines = doc.splitTextToSize(r.commento || '', W - M * 2 - 6);
  doc.text(commentLines, M + 3, y + 4);
  y += commentLines.length * 4 + 6;

  // raccomandazioni
  if (Array.isArray(r.raccomandazioni) && r.raccomandazioni.length) {
    doc.setTextColor(232, 255, 71);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('RACCOMANDAZIONI', M, y + 2);
    y += 5;
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    r.raccomandazioni.forEach(rec => {
      const lines = doc.splitTextToSize('• ' + rec, W - M * 2 - 4);
      doc.text(lines, M, y + 4);
      y += lines.length * 4 + 1;
    });
    y += 4;
  }

  // immagine
  if (r.image) {
    try {
      const imgH = 45;
      doc.setFillColor(26, 26, 26);
      doc.roundedRect(M, y, W - M * 2, imgH + 6, 3, 3, 'F');
      doc.addImage(r.image, 'JPEG', M + 3, y + 3, (imgH * 4) / 3, imgH);
    } catch (e) {}
    y += 56;
  }

  // firma
  const signY = Math.max(y, 220);
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.3);
  doc.line(M, signY + 20, W / 2 - 10, signY + 20);
  doc.setTextColor(136, 136, 136);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('FIRMA CLIENTE', M, signY + 25);
  if (r.firma) {
    try { doc.addImage(r.firma, 'PNG', M, signY, 70, 18); } catch (e) {}
  }

  // Disclaimer (above the brand footer)
  doc.setTextColor(110, 110, 110);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  const discLines = doc.splitTextToSize(PDF_DISCLAIMER, W - M * 2);
  doc.text(discLines, M, 273);

  // footer
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 285, W, 12, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Generato da TireCheckTire · PezzaliApp', W / 2, 291, { align: 'center' });

  const filename = `TireCheck_${(r.targa || 'report').replace(/[^A-Z0-9]/gi, '')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}
