const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { generateReportPDF } = require('../services/pdfService');

const router = express.Router();

router.get('/:datasetId/pdf', requireAuth, (req, res) => {
  const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(req.params.datasetId);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found.' });
  if (dataset.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to access this dataset.' });
  }

  const row = db
    .prepare('SELECT * FROM analyses WHERE dataset_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(dataset.id);
  if (!row) return res.status(404).json({ error: 'Run an analysis first before downloading a report.' });

  const analysis = JSON.parse(row.result_json);
  const doc = generateReportPDF({ datasetName: dataset.name, analysis, generatedBy: req.user.name });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="FlowLens_Report_${dataset.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`
  );
  doc.pipe(res);
  doc.end();
});

module.exports = router;
