/**
 * MODU — Supplier form (moduportugal.eu/supplier-form/)
 * Install in the Google Sheet "MODU | Supplier Registry": Extensions > Apps Script.
 * Writes each submission to the tab "Website intake" and emails an alert.
 */
var TAB = 'Website intake';
var ALERT_TO = 'modu@house05.eu';
var FIELDS = [
  ['factory_name', 'Company'], ['contact_person', 'Contact person'], ['email', 'Email'],
  ['phone', 'Phone'], ['website', 'Website'], ['location', 'Location'], ['segment', 'Segment'],
  ['product_speciality', 'Product speciality'], ['moq', 'MOQ'], ['monthly_capacity', 'Monthly capacity'],
  ['certifications', 'Certifications'], ['notes', 'Notes'], ['consent', 'Consent'], ['page', 'Page']
];

function doPost(e) {
  var p = (e && e.parameters) || {};
  if (val(p, 'company_website')) return ok(); // honeypot
  if (!val(p, 'email') || !val(p, 'factory_name')) return ok();

  var sheet = getTab();
  var row = [new Date(), 'New'];
  FIELDS.forEach(function (f) { row.push(val(p, f[0])); });
  sheet.appendRow(row);

  var lines = FIELDS.map(function (f) { return f[1] + ': ' + val(p, f[0]); });
  MailApp.sendEmail({
    to: ALERT_TO,
    replyTo: val(p, 'email'),
    subject: 'New supplier submission: ' + val(p, 'factory_name') + ' (' + val(p, 'location') + ')',
    body: lines.join('\n') + '\n\nSheet: ' + SpreadsheetApp.getActive().getUrl()
  });
  return ok();
}

function getTab() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(['Received', 'Status'].concat(FIELDS.map(function (f) { return f[1]; })));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, FIELDS.length + 2).setFontWeight('bold');
  }
  return sh;
}

function val(p, k) { return p[k] ? p[k].join(', ').toString().slice(0, 5000) : ''; }
function ok() { return ContentService.createTextOutput('{"ok":true}').setMimeType(ContentService.MimeType.JSON); }

/** Run once from the editor to create the tab and authorise email sending. */
function setup() { getTab(); MailApp.getRemainingDailyQuota(); }
