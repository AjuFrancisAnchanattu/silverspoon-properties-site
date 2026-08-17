/* Shared across every page — builds the "Enquire Now" contact modal once,
   appends it to <body>, and wires it up to any element carrying
   data-contact-modal (the floating pill's "Contact Us" item, the
   footer's "Contact Us" link, etc.) so those open the modal in place
   instead of navigating to the coming-soon placeholder. See
   css/base.css for the .contact-modal* rules this markup relies on. */
(function () {
  const WHATSAPP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M20.5 11.9c0 4.7-3.8 8.5-8.5 8.5-1.5 0-2.9-.4-4.1-1.1L3.5 20.5l1.2-4.3a8.4 8.4 0 0 1-1.2-4.3c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5Z"/></svg>';
  const PHONE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 1-2Z"/></svg>';
  const EMAIL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>';
  const CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const overlay = document.createElement('div');
  overlay.className = 'contact-modal-overlay';
  overlay.innerHTML = `
    <button class="contact-modal-close" type="button" aria-label="Close">${CLOSE_ICON}</button>
    <div class="contact-modal" role="dialog" aria-modal="true" aria-label="Enquire now">
      <div class="cm-head">
        <h2>Enquire now</h2>
        <div class="cm-icons">
          <a href="https://wa.me/971527693333" aria-label="WhatsApp Leena">${WHATSAPP_ICON}</a>
          <a href="tel:+971527693333" aria-label="Call Leena">${PHONE_ICON}</a>
          <a href="mailto:Info@silverspoonprop.com" aria-label="Email Leena">${EMAIL_ICON}</a>
        </div>
      </div>

      <form>
        <div class="cm-row">
          <div class="cm-field"><label for="cmName">Name</label><input id="cmName" type="text" required></div>
          <div class="cm-field"><label for="cmLastName">Last Name</label><input id="cmLastName" type="text" required></div>
        </div>
        <div class="cm-row">
          <div class="cm-field"><label for="cmPhone">Phone</label><input id="cmPhone" type="tel" required></div>
          <div class="cm-field"><label for="cmEmail">Email</label><input id="cmEmail" type="email" required></div>
        </div>
        <div class="cm-field full">
          <label for="cmAreas">What areas or developments are you looking to buy in?</label>
          <input id="cmAreas" type="text">
        </div>
        <div class="cm-field full">
          <label for="cmMessage">Message</label>
          <textarea id="cmMessage" rows="2"></textarea>
        </div>
        <div class="cm-actions">
          <button class="cm-send" type="submit">Send</button>
        </div>
      </form>

      <div class="cm-success">Thank you — Leena will be in touch shortly.</div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modal = overlay.querySelector('.contact-modal');
  const closeBtn = overlay.querySelector('.contact-modal-close');
  const form = overlay.querySelector('form');

  function openModal(e) {
    if (e) e.preventDefault();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-contact-modal]').forEach(el => {
    el.addEventListener('click', openModal);
  });
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    modal.classList.add('is-sent');
  });
})();
