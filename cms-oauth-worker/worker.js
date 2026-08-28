/**
 * Cloudflare Worker — GitHub OAuth proxy for Decap CMS's "github" backend.
 *
 * The CMS admin panel (site's /admin) can't do the GitHub OAuth token
 * exchange itself — that step needs a client secret, which must never sit
 * in a static site's client-side code. This tiny Worker is the only piece
 * that ever sees the secret, and it never gets shown to the browser.
 *
 * Two routes:
 *   GET /auth       — CMS opens a popup here, this redirects to GitHub's
 *                      own authorize screen.
 *   GET /callback    — GitHub redirects back here with a one-time code;
 *                      this exchanges it for an access token and hands
 *                      it back to the CMS popup via postMessage.
 *
 * Required environment variables (set as Worker secrets, never committed
 * to the repo — see README.md in this folder for exact steps):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

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
    if (url.pathname === '/auth') return handleAuth(request, env);
    if (url.pathname === '/callback') return handleCallback(request, env);
    return new Response('Silver Spoon Properties — Decap CMS GitHub OAuth proxy. Routes: /auth, /callback', { status: 200 });
  },
};
