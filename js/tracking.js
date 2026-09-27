/* Shared across every page — loads Google Ads / Google Analytics tags,
   and exposes a conversion-firing helper, based on values Leena sets
   herself in the CMS admin panel (Site Settings > Analytics & Ads
   Tracking). No code change or redeploy needed to launch a new
   campaign, swap a conversion ID, or add Google Tag Manager.

   Reads content/settings/tracking.json straight from this repo's main
   branch (same file Decap CMS writes to when that settings entry is
   saved). If every field is still blank — the default, out of the box
   — this is a complete no-op: no scripts load, no network calls happen
   beyond the one settings fetch, and the site works exactly as normal.
   Any fetch/parse failure is swallowed the same way, so a tracking
   misconfiguration can never break the site itself. */
(function () {
  const SETTINGS_URL = 'https://raw.githubusercontent.com/AjuFrancisAnchanattu/silverspoon-properties-site/main/content/settings/tracking.json';

  // Real implementation is swapped in below once a Conversion ID +
  // Label are both configured; calling this before then (or if they're
  // never configured) is always safe and simply does nothing.
  window.SSPFireConversion = function () {};

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const el = document.createElement('script');
      el.src = src;
      el.async = true;
      el.onload = resolve;
      el.onerror = reject;
      document.head.appendChild(el);
    });
  }

  fetch(SETTINGS_URL)
    .then(res => (res.ok ? res.json() : null))
    .then(settings => {
      if (!settings) return;

      const tagIds = (settings.googleTagIds || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (tagIds.length) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagIds[0])}`)
          .then(() => {
            window.gtag('js', new Date());
            tagIds.forEach(id => window.gtag('config', id));
          })
          .catch(() => {});
      }

      if (settings.gtmContainerId) {
        (function (w, d, s, l, i) {
          w[l] = w[l] || [];
          w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
          const f = d.getElementsByTagName(s)[0];
          const j = d.createElement(s);
          const dl = l !== 'dataLayer' ? '&l=' + l : '';
          j.async = true;
          j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
          f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', settings.gtmContainerId);

        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(settings.gtmContainerId)}`;
        iframe.height = 0;
        iframe.width = 0;
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';
        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
      }

      if (settings.googleAdsConversionId && settings.googleAdsConversionLabel) {
        window.SSPFireConversion = function () {
          if (typeof window.gtag !== 'function') return;
          window.gtag('event', 'conversion', {
            send_to: `${settings.googleAdsConversionId}/${settings.googleAdsConversionLabel}`,
          });
        };
      }
    })
    .catch(() => {});
})();
