Expected video files — filenames referenced exactly in the HTML.
Drop files in here with these exact names and they'll pick up automatically.
All hero sections show an animated placeholder gradient (css/base.css,
.hero-fallback-bg) until these load, so nothing looks broken in the
meantime.

about-hero.mp4
  Used in: about.html, <section class="hero"> <video>
  Full-bleed background behind "About Leena Parwani." Should work with
  a bottom-left text overlay — avoid busy detail in the lower-left third
  of frame. Muted/looping, so keep it short (10-20s) and seamless.

home-hero.mp4
  Used in: home.html, <section class="hero"> <video>
  Full-bleed background behind the centered "Leena Parwani" headline +
  Book a Call / Get Shortlisted bar. Content sits dead-center, so avoid
  important visual detail in the middle of frame. Muted/looping, 10-20s.

representation-hero.mp4
  Used in: representation.html, <section class="hero"> <video>
  Full-bleed background behind "Private Client Representation." Same
  bottom-left text overlay treatment as about-hero.mp4 — keep the lower-left
  third of frame uncluttered. Something that reads as attentive, one-on-one
  service works well here (a private viewing, a walkthrough, a handshake
  over a table) rather than a skyline shot, to visually differentiate this
  page from Home/About. Muted/looping, 10-20s.

concept-01-v1-web.mp4
  Used in: index.html (home), <section class="brand-film"> <video>
  Web-compressed copy of the client-supplied "concept 01 v1.mp4" brand film
  (Leena on camera, "Who is your agent really working for?", ends on
  "Book a 15-minute call"). Original was 214 MB / 1080p 50fps; this copy is
  1080p 25fps H.264 ~2.4 Mbps + AAC audio (~36 MB). The original stays local
  only (git-ignored, over GitHub's 100 MB file limit). Poster frame:
  images/commenimages/concept-01-poster.jpg.
