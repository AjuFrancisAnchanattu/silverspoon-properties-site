/* Shared across every page — toggles "is-scrolled" on the fixed header
   once the page scrolls, so the overlay nav variant (transparent over a
   hero) gains an opaque background and stays legible. See css/base.css
   for the header.site-nav / header.site-nav--overlay(.is-scrolled) rules. */
(function () {
  const nav = document.querySelector('header.site-nav');
  if (!nav) return;

  function syncScrolled() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', syncScrolled, { passive: true });
  syncScrolled();
})();
