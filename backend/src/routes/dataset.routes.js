const express = require('express');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const datasets =
    req.user.role === 'admin'
      ? db
          .prepare(
            `SELECT d.*, u.name as owner_name, u.email as owner_email
             FROM datasets d JOIN users u ON u.id = d.user_id
             ORDER BY d.created_at DESC`
          )
          .all()
      : db.prepare('SELECT * FROM datasets WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);

  res.json({ datasets });
});

router.delete('/:id', requireAuth, (req, res) => {
  const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(req.params.id);
  if (!dataset) return res.status(404).json({ error: 'Dataset not found.' });
  if (dataset.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this dataset.' });
  }
  db.prepare('DELETE FROM datasets WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
