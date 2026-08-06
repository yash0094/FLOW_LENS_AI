const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { fetchSheetValues } = require('../services/sheetsService');
const { parseSheetValues } = require('../services/csvParser');

const router = express.Router();

router.post('/import', requireAuth, async (req, res) => {
  const { spreadsheetUrl, range, name } = req.body;
  if (!spreadsheetUrl) return res.status(400).json({ error: 'spreadsheetUrl is required.' });

  if (!req.user.google_access_token) {
    return res.status(400).json({
      error:
        'This account is not connected to Google. Sign in with Google (or reconnect) to import from Sheets.',
    });
  }

  try {
    const values = await fetchSheetValues(req.user.google_access_token, spreadsheetUrl, range);
    const { records, errors } = parseSheetValues(values);

    if (!records.length) {
      return res.status(400).json({ error: 'Could not parse any valid rows from this sheet.', details: errors });
    }

    const datasetId = uuidv4();
    const insertDataset = db.prepare(
      'INSERT INTO datasets (id, user_id, name, source, row_count) VALUES (?, ?, ?, ?, ?)'
    );
    const insertRecord = db.prepare(
      'INSERT INTO records (dataset_id, item_id, stage, entry_time, exit_time, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const tx = db.transaction(() => {
      insertDataset.run(datasetId, req.user.id, name || 'Google Sheet import', 'sheets', records.length);
      for (const r of records) {
        insertRecord.run(datasetId, r.item_id, r.stage, r.entry_time, r.exit_time, r.duration_seconds);
      }
    });
    tx();

    res.json({
      dataset: { id: datasetId, name: name || 'Google Sheet import', row_count: records.length },
      warnings: errors.slice(0, 20),
      skippedRows: errors.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error:
        'Failed to fetch this sheet. Make sure the URL is correct, the sheet is accessible to your Google account, and your session has not expired.',
    });
  }
});

module.exports = router;
