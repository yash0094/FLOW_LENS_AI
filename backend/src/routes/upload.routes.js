const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { parseCSVBuffer, parseXLSXBuffer } = require('../services/csvParser');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const isXlsx = req.file.originalname.match(/\.xlsx?$/i);
  const { records, errors } = isXlsx ? parseXLSXBuffer(req.file.buffer) : parseCSVBuffer(req.file.buffer);

  if (!records.length) {
    return res.status(400).json({ error: 'Could not parse any valid rows from this file.', details: errors });
  }

  const datasetId = uuidv4();
  const name = req.body.name || req.file.originalname;

  const insertDataset = db.prepare(
    'INSERT INTO datasets (id, user_id, name, source, row_count) VALUES (?, ?, ?, ?, ?)'
  );
  const insertRecord = db.prepare(
    'INSERT INTO records (dataset_id, item_id, stage, entry_time, exit_time, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const tx = db.transaction(() => {
    insertDataset.run(datasetId, req.user.id, name, 'upload', records.length);
    for (const r of records) {
      insertRecord.run(datasetId, r.item_id, r.stage, r.entry_time, r.exit_time, r.duration_seconds);
    }
  });
  tx();

  res.json({
    dataset: { id: datasetId, name, row_count: records.length },
    warnings: errors.slice(0, 20),
    skippedRows: errors.length,
  });
});

module.exports = router;
