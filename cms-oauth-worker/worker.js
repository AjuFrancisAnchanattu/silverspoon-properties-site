/**
 * Cloudflare Worker — GitHub OAuth proxy for Decap CMS, plus a lead-capture
 * endpoint for the site's contact forms.
 *
 * The CMS admin panel (site's /admin) can't do the GitHub OAuth token
 * exchange itself — that step needs a client secret, which must never sit
 * in a static site's client-side code. This tiny Worker is the only piece
 * that ever sees the secret, and it never gets shown to the browser.
 *
 * Routes:
 *   GET  /auth         — CMS opens a popup here, this redirects to GitHub's
 *                        own authorize screen.
 *   GET  /callback      — GitHub redirects back here with a one-time code;
 *                        this exchanges it for an access token and hands
 *                        it back to the CMS popup via postMessage.
 *   POST /submit-lead   — contact.html's forms POST here. The Worker reads
 *                        the visitor's IP and country straight off
 *                        Cloudflare's own request metadata (no external
 *                        geolocation API needed), then forwards the
 *                        enriched submission to a Google Apps Script Web
 *                        App, which appends a row to Leena's lead-tracking
 *                        Google Sheet.
 *
 * Required environment variables (set as Worker secrets, never committed
 * to the repo — see README.md in this folder for exact steps):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *   SHEETS_WEBHOOK_URL   — the Google Apps Script Web App URL that appends
 *                          rows to the lead-tracking sheet
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

// Allow the live site (and localhost, for local testing) to call
// /submit-lead cross-origin. Tighten this list if the site ever moves
// domains.
const ALLOWED_ORIGINS = [
  'https://ajufrancisanchanattu.github.io',
  'https://silverspoonprop.com',
  'https://www.silverspoonprop.com',
  'http://localhost:8910',
];

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function handleSubmitLead(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = { ...corsHeaders(origin), 'Content-Type': 'application/json' };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
  }

  // Basic shape validation — reject junk before it ever reaches the sheet.
  const required = ['formType', 'name', 'phone', 'email'];
  for (const field of required) {
    if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), { status: 400, headers });
    }
  }

  if (!env.SHEETS_WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: 'Lead storage is not configured' }), { status: 500, headers });
  }

  const enriched = {
    timestamp: new Date().toISOString(),
    formType: body.formType,
    name: body.name.trim(),
    phone: body.phone.trim(),
    email: body.email.trim(),
    budgetRange: body.budgetRange || '',
    projectOrDeveloper: body.projectOrDeveloper || '',
    purpose: body.purpose || '',
    timeline: body.timeline || '',
    sourcePage: body.sourcePage || '',
    projectName: body.projectName || '',
    message: body.message || '',
    ip: request.headers.get('cf-connecting-ip') || 'Unknown',
    country: request.cf && request.cf.country ? request.cf.country : 'Unknown',
  };

  try {
    const sheetRes = await fetch(env.SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enriched),
    });
    if (!sheetRes.ok) {
      const text = await sheetRes.text();
      return new Response(JSON.stringify({ error: 'Sheet write failed', detail: text }), { status: 502, headers });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Sheet write failed', detail: String(err) }), { status: 502, headers });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

async function handleAuth(request, env) {
  const url = new URL(request.url);
  const scope = url.searchParams.get('scope') || 'repo,user';

  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', crypto.randomUUID());

  return Response.redirect(authorizeUrl.toString(), 302);
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) return new Response('Missing code parameter', { status: 400 });

  const tokenRes = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return new Response(`GitHub OAuth error: ${tokenData.error_description || tokenData.error}`, { status: 400 });
  }

  // Decap CMS's popup-based auth flow: the popup posts an "authorizing"
  // ping, waits for the opener (the admin panel) to acknowledge, then
  // sends the real token in a second message. This exact handshake is
  // what decap-cms's default GitHub backend expects — don't simplify it
  // to a single postMessage, the CMS side won't pick it up.
  const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });
  const html = `<!DOCTYPE html><html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:success:${payload.replace(/'/g, "\\'")}',
      e.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/submit-lead' && request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('Origin') || '') });
    }
    if (url.pathname === '/submit-lead' && request.method === 'POST') {
      return handleSubmitLead(request, env);
    }
    if (url.pathname === '/auth') return handleAuth(request, env);
    if (url.pathname === '/callback') return handleCallback(request, env);
    return new Response('Silver Spoon Properties — Decap CMS GitHub OAuth proxy + lead capture. Routes: /auth, /callback, /submit-lead', { status: 200 });
  },
};
