# Lead capture — one-time setup

Every submission on the "Get Shortlisted" form now gets saved permanently
to a Google Sheet — with the visitor's IP address, country, which page
they came from, and the project name if they arrived from a project page —
in addition to the pre-filled email it already sends to your inbox.

This reuses the same Cloudflare Worker already running the CMS login
(`cms-oauth-worker/worker.js` — it now has a third route, `/submit-lead`,
alongside the two it already had). None of this needs coding knowledge —
every value you need to enter is spelled out exactly below.

## Steps

**1. Create the Google Sheet**

- Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
- Name it something like `Silver Spoon Properties — Leads`.
- Leave it empty — the script in the next step creates the header row automatically the first time a lead comes in.

**2. Add the Apps Script**

- In the sheet, go to **Extensions → Apps Script**.
- Delete any placeholder code in the editor.
- Copy the full contents of `google-apps-script.js` (the file next to this one) and paste it in.
- Click **Save** (the disk icon), give the project a name if asked, e.g. `Lead Capture`.

**3. Deploy it as a Web App**

- Click **Deploy → New deployment**.
- Click the gear icon next to "Select type" → choose **Web app**.
- Fill in:
  - **Execute as**: `Me`
  - **Who has access**: `Anyone`
- Click **Deploy**.
- Google will ask you to authorize the script — click through the consent screen (it'll warn "Google hasn't verified this app" since it's your own private script; click **Advanced → Go to Lead Capture (unsafe)** to proceed, this is expected for a script only you deployed).
- Copy the **Web app URL** it gives you — something like `https://script.google.com/macros/s/AKfycb.../exec`. **You'll need this in step 4.**

**4. Add the URL to the Worker**

- Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → open the same Worker you already deployed for the CMS login (e.g. `ssp-cms-auth`).
- Click **Edit code**. Select everything in the editor, delete it, and paste in the full updated contents of `worker.js` (the file in `cms-oauth-worker/`, next to this folder) — it now has the lead-capture route built in.
- Click **Save and Deploy**.
- Go to **Settings → Variables and Secrets** → **Add** a new **Secret** variable:
  - `SHEETS_WEBHOOK_URL` → paste the Web app URL from step 3.
- Save — the Worker redeploys automatically with the new secret available.

**5. Test it**

- Go to the live site's contact page, fill out and submit the "Get Shortlisted" form with test details.
- Check the Google Sheet — a new row should appear within a few seconds, including an IP address and country.
- You can delete that test row once confirmed.

## Why it has to work this way

GitHub Pages can only serve static files — it can't run code to save form
submissions anywhere, or see a visitor's IP address. The Cloudflare Worker
sits in between: the browser sends the form data to it, the Worker reads
the visitor's real IP and country straight off Cloudflare's own request
metadata (no third-party geolocation lookup needed), and forwards the
whole thing to the Google Apps Script, which appends it as a row. If the
Worker or the Sheet is ever unreachable, the visitor still gets the
pre-filled email fallback — the Sheet write happens silently in the
background and never blocks the form from completing.
