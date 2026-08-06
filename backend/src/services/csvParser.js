const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

// Flexible header matching: normalizes header text and matches against known aliases.
const FIELD_ALIASES = {
  item_id: ['itemid', 'item', 'orderid', 'order', 'ordernumber', 'id', 'ticketid', 'ticket', 'unitid'],
  stage: ['stage', 'step', 'phase', 'stagename', 'process', 'station'],
  entry_time: ['entrytime', 'start', 'starttime', 'in', 'entry', 'begin', 'begintime'],
  exit_time: ['exittime', 'end', 'endtime', 'out', 'exit', 'finish', 'finishtime'],
};

function normalizeHeader(h) {
  return String(h || '').toLowerCase().replace(/[\s_\-]/g, '');
}

function mapHeaders(headers) {
  const map = {};
  const normalized = headers.map(normalizeHeader);
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.includes(h) || h === field.replace(/_/g, ''));
    if (idx !== -1) map[field] = headers[idx];
  }
  return map;
}

function parseDate(value) {
  if (value instanceof Date) return value;
  if (typeof value === 'number') {
    // Excel serial date
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 86400000);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function rowsToRecords(rows) {
  if (!rows.length) return { records: [], errors: ['File appears to be empty.'] };

  const headers = Object.keys(rows[0]);
  const map = mapHeaders(headers);
  const missing = ['item_id', 'stage', 'entry_time', 'exit_time'].filter((f) => !map[f]);
  if (missing.length) {
    return {
      records: [],
      errors: [
        `Could not find columns for: ${missing.join(', ')}. ` +
          `Detected headers: ${headers.join(', ')}. ` +
          `Expected something like item_id, stage, entry_time, exit_time (flexible naming allowed).`,
      ],
    };
  }

  const records = [];
  const errors = [];
  rows.forEach((row, i) => {
    const itemId = String(row[map.item_id] ?? '').trim();
    const stage = String(row[map.stage] ?? '').trim();
    const entry = parseDate(row[map.entry_time]);
    const exit = parseDate(row[map.exit_time]);

    if (!itemId || !stage || !entry || !exit) {
      errors.push(`Row ${i + 2}: skipped (missing or unparseable value).`);
      return;
    }
    const durationSeconds = (exit.getTime() - entry.getTime()) / 1000;
    if (durationSeconds < 0) {
      errors.push(`Row ${i + 2}: skipped (exit_time is before entry_time).`);
      return;
    }
    records.push({
      item_id: itemId,
      stage,
      entry_time: entry.toISOString(),
      exit_time: exit.toISOString(),
      duration_seconds: durationSeconds,
    });
  });

  return { records, errors };
}

function parseCSVBuffer(buffer) {
  const text = buffer.toString('utf-8');
  const rows = parse(text, { columns: true, skip_empty_lines: true, trim: true });
  return rowsToRecords(rows);
}

function parseXLSXBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rowsToRecords(rows);
}

// Used for Google Sheets values (array of arrays, first row = header)
function parseSheetValues(values) {
  if (!values || !values.length) return { records: [], errors: ['Sheet has no data.'] };
  const [header, ...rest] = values;
  const rows = rest.map((r) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = r[i]));
    return obj;
  });
  return rowsToRecords(rows);
}

module.exports = { parseCSVBuffer, parseXLSXBuffer, parseSheetValues };
