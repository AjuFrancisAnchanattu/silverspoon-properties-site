# CMS login — one-time setup

This folder holds the code for a small Cloudflare Worker that lets the
`/admin` content manager log in with GitHub. It's separate from the main
site (GitHub Pages can't run this kind of code itself), so it needs a
one-time deploy — after that, nothing more to maintain.

None of these steps need coding knowledge. There are two things that only
you can do (creating accounts / clicking "authorize" needs a real human),
but every value you need to enter is spelled out exactly below.

## Steps

**1. Deploy the Worker**

- Go to [dash.cloudflare.com](https://dash.cloudflare.com) and sign up free if you don't already have an account.
- **Workers & Pages** → **Create** → **Create Worker**.
- Give it a name, e.g. `ssp-cms-auth`. Click **Deploy** to create it with the default template first.
- Click **Edit code**. Delete everything in the editor and paste in the full contents of `worker.js` (the file next to this one). Click **Save and Deploy**.
- Cloudflare will show you the Worker's URL — something like `https://ssp-cms-auth.<your-subdomain>.workers.dev`. **Copy this URL**, you'll need it in the next two steps.

**2. Register a GitHub OAuth App**

- Go to [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**.
- Fill in:
  - **Application name**: `Silver Spoon Properties CMS`
  - **Homepage URL**: `https://ajufrancisanchanattu.github.io/silverspoon-properties-site/`
  - **Authorization callback URL**: `<your Worker URL from step 1>/callback` — e.g. `https://ssp-cms-auth.your-subdomain.workers.dev/callback`
- Click **Register application**.
- On the app's page, click **Generate a new client secret**. Copy the **Client ID** (visible on the page) and the **Client Secret** (shown once, right after you generate it) somewhere safe — you'll need both in the next step.

**3. Add the secrets to the Worker**

- Back in the Cloudflare dashboard, open your Worker → **Settings** → **Variables and Secrets**.
- Add two **Secret** variables (not plain text variables — pick "Encrypt"):
  - `GITHUB_CLIENT_ID` → paste the Client ID from step 2
  - `GITHUB_CLIENT_SECRET` → paste the Client Secret from step 2
- Save — the Worker redeploys automatically with the secrets available.

**4. Hand it back**

Send me:
- The Worker URL from step 1
- The Client ID from step 2 (the secret itself never needs to leave Cloudflare)

I'll drop the Worker URL into `admin/config.yml`'s `base_url` and push — after that, `https://ajufrancisanchanattu.github.io/silverspoon-properties-site/admin/` will show a "Login with GitHub" screen. Log in with the GitHub account that has access to this repo (`AjuFrancisAnchanattu`), and you're in.

## Why it has to work this way

Decap CMS edits files by committing straight to this GitHub repo — there's
no separate database. To do that, it needs to prove to GitHub who's
logging in, and that handshake (OAuth) requires a client secret that can
never be visible in the browser or committed to the repo. This Worker is
the only place that secret lives, and its only job is that one exchange —
nothing else about the site depends on it, and if it's ever down, everything
except the `/admin` login keeps working exactly as normal.
