/* Shared across every page — toggles "is-scrolled" on the fixed header
   once the page scrolls, so the overlay nav variant (transparent over a
   hero) gains an opaque background and stays legible. See css/base.css
   for the header.site-nav / header.site-nav--overlay(.is-scrolled) rules.
   Also drives the mobile hamburger menu (header.site-nav .menu-toggle /
   nav.primary — see the max-width:1080px rules in base.css). */
(function () {
  const nav = document.querySelector('header.site-nav');
  if (!nav) return;

  function syncScrolled() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', syncScrolled, { passive: true });
  syncScrolled();

  const toggle = nav.querySelector('.menu-toggle');
  const menu = nav.querySelector('nav.primary');
  if (!toggle || !menu) return;

  function closeMenu() {
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    nav.classList.remove('is-nav-open');
    document.body.style.overflow = '';
  }
  function openMenu() {
    toggle.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    nav.classList.add('is-nav-open');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) closeMenu(); else openMenu();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) closeMenu(); });
})();
