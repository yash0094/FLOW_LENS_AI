const PDFDocument = require('pdfkit');

const ACCENT = '#5B21B6'; // deep violet, matches frontend brand
const ACCENT_LIGHT = '#EDE9FE';
const DANGER = '#DC2626';
const OK = '#16A34A';
const TEXT_DARK = '#1F2937';
const TEXT_MUTED = '#6B7280';

function fmtSeconds(s) {
  if (s == null || isNaN(s)) return '-';
  const totalMin = s / 60;
  if (totalMin < 60) return `${totalMin.toFixed(1)} min`;
  const hrs = totalMin / 60;
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
  return `${(hrs / 24).toFixed(1)} days`;
}

function generateReportPDF({ datasetName, analysis, generatedBy }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  // ---- Header ----
  doc.rect(0, 0, doc.page.width, 90).fill(ACCENT);
  doc
    .fillColor('#fff')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('FlowLens — Bottleneck Report', 50, 28);
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#E5E7EB')
    .text(`Dataset: ${datasetName}   |   Generated: ${new Date().toLocaleString()}   |   By: ${generatedBy}`, 50, 58);

  doc.moveDown(4);
  doc.fillColor(TEXT_DARK);

  // ---- Executive summary ----
  doc.fontSize(14).font('Helvetica-Bold').fillColor(ACCENT).text('Executive Summary');
  doc.moveDown(0.3);
  doc.fontSize(10.5).font('Helvetica').fillColor(TEXT_DARK).text(analysis.summaryText, { align: 'left', lineGap: 3 });
  doc.moveDown(1);

  // ---- Key numbers row ----
  const stats = [
    ['Items analyzed', String(analysis.totalItems)],
    ['Stages analyzed', String(analysis.totalStages)],
    ['Bottleneck stages', String(analysis.bottleneckStages.length)],
    ['Stuck items flagged', String(analysis.stuckItemCount)],
  ];
  const boxW = (doc.page.width - 100) / 4;
  let x = 50;
  const boxY = doc.y;
  stats.forEach(([label, value]) => {
    doc.roundedRect(x, boxY, boxW - 8, 55, 6).fill(ACCENT_LIGHT);
    doc.fillColor(ACCENT).fontSize(16).font('Helvetica-Bold').text(value, x + 10, boxY + 10);
    doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(label, x + 10, boxY + 34, { width: boxW - 20 });
    x += boxW;
  });
  doc.y = boxY + 70;
  doc.moveDown(1);

  // ---- Stage-by-stage breakdown ----
  doc.fontSize(14).font('Helvetica-Bold').fillColor(ACCENT).text('Stage-by-Stage Breakdown');
  doc.moveDown(0.4);

  analysis.stageReports.forEach((s, idx) => {
    ensureSpace(doc, 120);
    const badgeColor = s.isBottleneck ? DANGER : OK;
    const badgeText = s.isBottleneck ? 'BOTTLENECK' : 'Healthy';

    doc.fontSize(12).font('Helvetica-Bold').fillColor(TEXT_DARK).text(`${idx + 1}. ${s.stage}`, { continued: true });
    doc.font('Helvetica-Bold').fillColor(badgeColor).text(`   [${badgeText}]`);
    doc.moveDown(0.15);

    doc
      .fontSize(9.5)
      .font('Helvetica')
      .fillColor(TEXT_MUTED)
      .text(
        `Avg: ${fmtSeconds(s.mean)}   Median: ${fmtSeconds(s.median)}   Std Dev: ${fmtSeconds(
          s.stddev
        )}   Items: ${s.count}   Outliers: ${s.outlierCount}   Z-score: ${s.zScore.toFixed(2)}`
      );
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor(TEXT_DARK).font('Helvetica-Bold').text(`Cause: `, { continued: true });
    doc.font('Helvetica').text(s.cause);
    doc.fontSize(9.5).fillColor(TEXT_MUTED).text(s.explanation, { lineGap: 2 });
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor(ACCENT).text('Recommendation: ', { continued: true });
    doc.font('Helvetica').fillColor(TEXT_DARK).text(s.recommendation, { lineGap: 2 });
    doc.moveDown(0.7);
  });

  // ---- Stuck items table ----
  if (analysis.stuckItems.length) {
    doc.addPage();
    doc.fontSize(14).font('Helvetica-Bold').fillColor(ACCENT).text('Stuck Items (Top Outliers)');
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor(TEXT_MUTED)
      .text('Items whose stage duration exceeded the statistical outlier ceiling (Q3 + 1.5×IQR) for that stage.');
    doc.moveDown(0.5);

    const colX = [50, 170, 290, 400, 480];
    const headers = ['Item ID', 'Stage', 'Duration', 'Expected Max', 'Exceeded By'];
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#fff');
    doc.rect(50, doc.y, doc.page.width - 100, 18).fill(ACCENT);
    let hy = doc.y - 18 + 4;
    headers.forEach((h, i) => doc.fillColor('#fff').text(h, colX[i], hy, { width: 110 }));
    doc.moveDown(1.2);

    analysis.stuckItems.slice(0, 30).forEach((item, i) => {
      ensureSpace(doc, 18);
      const rowY = doc.y;
      if (i % 2 === 0) doc.rect(50, rowY - 2, doc.page.width - 100, 16).fill('#F9FAFB');
      doc.fillColor(TEXT_DARK).font('Helvetica').fontSize(8.5);
      doc.text(item.item_id, colX[0], rowY, { width: 115 });
      doc.text(item.stage, colX[1], rowY, { width: 115 });
      doc.text(fmtSeconds(item.duration_seconds), colX[2], rowY, { width: 105 });
      doc.text(fmtSeconds(item.expected_ceiling_seconds), colX[3], rowY, { width: 75 });
      doc.fillColor(DANGER).text(fmtSeconds(item.exceeded_by_seconds), colX[4], rowY, { width: 90 });
      doc.moveDown(0.9);
    });
  }

  // ---- Footer page numbers ----
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(TEXT_MUTED)
      .text(`FlowLens Bottleneck Report — Page ${i + 1} of ${range.count}`, 50, doc.page.height - 40, {
        align: 'center',
        width: doc.page.width - 100,
      });
  }

  return doc;
}

function ensureSpace(doc, needed) {
  if (doc.y + needed > doc.page.height - 60) {
    doc.addPage();
  }
}

module.exports = { generateReportPDF };
