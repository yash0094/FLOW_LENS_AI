const { google } = require('googleapis');

function extractSpreadsheetId(urlOrId) {
  const match = String(urlOrId).match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId.trim();
}

async function fetchSheetValues(accessToken, spreadsheetUrlOrId, range) {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrlOrId);
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const sheets = google.sheets({ version: 'v4', auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: range || 'A1:Z10000',
  });
  return res.data.values || [];
}

module.exports = { fetchSheetValues, extractSpreadsheetId };
