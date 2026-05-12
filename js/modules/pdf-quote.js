// PDF preventivo
import { loadScript, formatEuro } from '../core/utils.js';
import { state } from '../core/state.js';

const JSPDF_CDN = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';

async function ensureJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await loadScript(JSPDF_CDN);
  return window.jspdf.jsPDF;
}

export async function generate(q) {
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
  doc.text('Preventivo pneumatici · by PezzaliApp', M, 16);

  const officina = state.settings.officina || 'Officina';
  const tel = state.settings.tel || '';
  const piva = state.settings.piva || '';
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(officina, W - M, 10, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  if (tel)  doc.text(tel,  W - M, 15, { align: 'right' });
  if (piva) doc.text('P.IVA ' + piva, W - M, 20, { align: 'right' });

  y = 36;
  doc.setTextColor(240, 240, 240);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Preventivo Pneumatici', M, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text(new Date(q.timestamp || Date.now()).toLocaleString('it-IT') + ' · n° ' + (q.id || '—'), M, y);
  y += 8;

  // cliente
  doc.setFillColor(26, 26, 26);
  doc.roundedRect(M, y, W - M * 2, 20, 3, 3, 'F');
  doc.setTextColor(232, 255, 71);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE', M + 4, y + 5);
  doc.setTextColor(240, 240, 240);
  doc.setFontSize(10);
  doc.text(q.cliente?.nome || 'N/D', M + 4, y + 11);
  doc.setFontSize(8);
  doc.setTextColor(136, 136, 136);
  doc.text([q.cliente?.tel, q.cliente?.targa, q.cliente?.tipo].filter(Boolean).join(' · '), M + 4, y + 17);
  y += 26;

  // pneumatici
  doc.setTextColor(232, 255, 71);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PNEUMATICI', M, y);
  y += 5;
  let totTires = 0;
  (q.tires || []).forEach(t => {
    const tot = (t.price || 0) * (t.qty || 1);
    totTires += tot;
    const sizeStr = t.size ? `${t.size.w}/${t.size.h} R${t.size.r}${t.size.cls || ''}` : '';
    const line = `${t.qty}× ${t.brand || 'Pneumatico'} ${sizeStr}${t.dot ? ' DOT ' + t.dot : ''}`;
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(line, M, y);
    doc.text(formatEuro(tot), W - M, y, { align: 'right' });
    y += 5;
  });

  // servizi
  if ((q.servizi || []).length) {
    y += 4;
    doc.setTextColor(232, 255, 71);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('SERVIZI', M, y);
    y += 5;
  }
  let totSvc = 0;
  (q.servizi || []).forEach(s => {
    const tot = (s.price || 0) * (s.qty || 1);
    totSvc += tot;
    doc.setTextColor(240, 240, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`${s.qty || 1}× ${s.nome}`, M, y);
    doc.text(formatEuro(tot), W - M, y, { align: 'right' });
    y += 5;
  });

  y += 6;
  doc.setDrawColor(40, 40, 40);
  doc.line(M, y, W - M, y);
  y += 7;

  // totale
  const totale = totTires + totSvc;
  doc.setTextColor(232, 255, 71);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTALE', M, y);
  doc.text(formatEuro(totale), W - M, y, { align: 'right' });
  y += 8;
  doc.setTextColor(136, 136, 136);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('IVA inclusa salvo diversa indicazione', M, y);

  // footer
  doc.setFillColor(13, 13, 13);
  doc.rect(0, 285, W, 12, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(7);
  doc.text('Generato da TireCheckTire · PezzaliApp', W / 2, 291, { align: 'center' });

  const filename = `Preventivo_${(q.cliente?.nome || 'cliente').replace(/[^A-Z0-9]/gi, '')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return { filename, totale };
}

// Versione text/whatsapp
export function toText(q) {
  const lines = [];
  lines.push('🛞 Preventivo TireCheckTire');
  lines.push((state.settings.officina || 'Officina'));
  lines.push('');
  lines.push(`Cliente: ${q.cliente?.nome || '-'}`);
  if (q.cliente?.tel) lines.push(`Tel: ${q.cliente.tel}`);
  if (q.cliente?.targa) lines.push(`Targa: ${q.cliente.targa}`);
  lines.push('');
  let tot = 0;
  (q.tires || []).forEach(t => {
    const sizeStr = t.size ? `${t.size.w}/${t.size.h} R${t.size.r}${t.size.cls || ''}` : '';
    const sub = (t.price || 0) * (t.qty || 1);
    tot += sub;
    lines.push(`• ${t.qty}× ${t.brand || 'Pneumatico'} ${sizeStr} — ${formatEuro(sub)}`);
  });
  (q.servizi || []).forEach(s => {
    const sub = (s.price || 0) * (s.qty || 1);
    tot += sub;
    lines.push(`• ${s.qty || 1}× ${s.nome} — ${formatEuro(sub)}`);
  });
  lines.push('');
  lines.push(`TOTALE: ${formatEuro(tot)}`);
  lines.push('IVA inclusa salvo diversa indicazione.');
  return lines.join('\n');
}
