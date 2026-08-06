const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { runAnalysis } = require('../services/bottleneckEngine');

const router = express.Router();

function getDatasetOrFail(req, res) {
  const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(req.params.datasetId);
  if (!dataset) {
    res.status(404).json({ error: 'Dataset not found.' });
    return null;
  }
  if (dataset.user_id !== req.user.id && req.user.role !== 'admin') {
    res.status(403).json({ error: 'Not authorized to access this dataset.' });
    return null;
  }
  return dataset;
}

router.post('/:datasetId/run', requireAuth, (req, res) => {
  const dataset = getDatasetOrFail(req, res);
  if (!dataset) return;

  const zThreshold = req.body?.zThreshold ?? req.user.z_threshold ?? 1.0;
  const records = db.prepare('SELECT * FROM records WHERE dataset_id = ?').all(dataset.id);

  const result = runAnalysis(records, Number(zThreshold));
  if (result.error) return res.status(400).json(result);

  const analysisId = uuidv4();
  db.prepare('INSERT INTO analyses (id, dataset_id, result_json, z_threshold) VALUES (?, ?, ?, ?)').run(
    analysisId,
    dataset.id,
    JSON.stringify(result),
    zThreshold
  );

  res.json({ analysisId, result });
});

router.get('/:datasetId/latest', requireAuth, (req, res) => {
  const dataset = getDatasetOrFail(req, res);
  if (!dataset) return;

  const row = db
    .prepare('SELECT * FROM analyses WHERE dataset_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(dataset.id);
  if (!row) return res.status(404).json({ error: 'No analysis has been run for this dataset yet.' });

  res.json({ analysisId: row.id, result: JSON.parse(row.result_json), createdAt: row.created_at });
});

module.exports = router;
