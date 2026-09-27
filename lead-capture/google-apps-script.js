/**
 * Google Apps Script — receives lead submissions from the Cloudflare Worker
 * (cms-oauth-worker/worker.js, /submit-lead route), appends each one as a
 * new row in this Google Sheet, and emails the Sheet's owner a summary of
 * every new lead.
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
 *
 * Email notifications need no extra setup — they're sent via MailApp,
 * using the Google account that owns this script/Sheet (the same "Execute
 * as: Me" identity from deployment), straight to that same account's own
 * inbox. Free, within Google's normal daily email quota for that account.
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
  'Message', // added for the project-page "Enquire Now" modal — kept
             // last so existing rows in an already-live sheet stay
             // aligned; only new submissions populate this column.
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
    data.message || '',
  ]);

  // A failed/quota-exhausted email should never make the lead itself look
  // like it failed to save — the row above already landed regardless.
  try {
    notifyOwner(data);
  } catch (err) {
    console.error('Lead email notification failed: ' + err);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function notifyOwner(data) {
  const ownerEmail = Session.getEffectiveUser().getEmail();
  if (!ownerEmail) return;

  const projectLine = data.projectName ? ` — ${data.projectName}` : '';
  const subject = `New Lead: ${data.name || 'Unknown'}${projectLine}`;

  const rows = [
    ['Timestamp', data.timestamp || new Date().toISOString()],
    ['Form Type', data.formType || ''],
    ['Name', data.name || ''],
    ['Phone', data.phone || ''],
    ['Email', data.email || ''],
    ['Budget Range', data.budgetRange || ''],
    ['Project / Developer of Interest', data.projectOrDeveloper || ''],
    ['Purpose', data.purpose || ''],
    ['Timeline', data.timeline || ''],
    ['Source Page', data.sourcePage || ''],
    ['Project Name', data.projectName || ''],
    ['Message', data.message || ''],
    ['IP Address', data.ip || ''],
    ['Country', data.country || ''],
  ].filter(([, value]) => value);

  const plainBody = rows.map(([label, value]) => `${label}: ${value}`).join('\n');

  const htmlRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:6px 12px 6px 0;font-weight:600;color:#141311;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:6px 0;color:#141311;">${escapeHtml(value)}</td>
      </tr>`)
    .join('');
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;font-size:14px;">
      <p>A new lead just came in on the Silver Spoon Properties site.</p>
      <table style="border-collapse:collapse;">${htmlRows}</table>
    </div>`;

  MailApp.sendEmail({
    to: ownerEmail,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}
