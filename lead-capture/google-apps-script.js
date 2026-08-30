/**
 * Google Apps Script — receives lead submissions from the Cloudflare Worker
 * (cms-oauth-worker/worker.js, /submit-lead route) and appends each one as
 * a new row in this Google Sheet.
 *
 * SETUP (see lead-capture/README.md for the full walkthrough):
 *   1. Open (or create) the Google Sheet Leena wants leads saved into.
 *   2. Extensions > Apps Script.
 *   3. Delete any placeholder code, paste this whole file in.
 *   4. Deploy > New deployment > type "Web app".
 *        - Execute as: Me
 *        - Who has access: Anyone
 *   5. Copy the deployment URL — that's the SHEETS_WEBHOOK_URL secret the
 *      Cloudflare Worker needs.
 */

const HEADERS = [
  'Timestamp',
  'Form Type',
  'Name',
  'Phone',
  'Email',
  'Budget Range',
  'Project / Developer of Interest',
  'Purpose',
  'Timeline',
  'Source Page',
  'Project Name (from project page)',
  'IP Address',
  'Country',
];

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  ensureHeaderRow(sheet);

  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.formType || '',
    data.name || '',
    data.phone || '',
    data.email || '',
    data.budgetRange || '',
    data.projectOrDeveloper || '',
    data.purpose || '',
    data.timeline || '',
    data.sourcePage || '',
    data.projectName || '',
    data.ip || '',
    data.country || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}
