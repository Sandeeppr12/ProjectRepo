const SHARED_SECRET = 'REPLACE_WITH_A_LONG_RANDOM_SECRET';

function doPost(event) {
  let request;
  try {
    request = JSON.parse(event.postData.contents);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request.' });
  }

  if (request.secret !== SHARED_SECRET) {
    return jsonResponse({ ok: false, error: 'Unauthorized.' });
  }

  const recipient = typeof request.to === 'string' ? request.to.trim() : '';
  const subject = typeof request.subject === 'string' ? request.subject.trim() : '';
  const body = typeof request.text === 'string' ? request.text : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)
      || !subject
      || subject.length > 200
      || !body
      || body.length > 5000) {
    return jsonResponse({ ok: false, error: 'Invalid email content.' });
  }

  try {
    GmailApp.sendEmail(recipient, subject, body, { name: 'Digital Vistara' });
    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('Gmail send failed:', error.message);
    return jsonResponse({ ok: false, error: 'Email delivery failed.' });
  }
}

function jsonResponse(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
