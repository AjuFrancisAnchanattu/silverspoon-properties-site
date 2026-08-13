Expected image files — filenames referenced exactly in the HTML/CSS.
Drop files in here with these exact names and they'll pick up automatically.

vision-values.jpg
  Used in: about.html, .vision-photo img
  About page's "Vision and Values" split section, right-hand panel.
  Landscape orientation, fills a min-height:640px column — a wide interior
  or architectural shot works best (matches the current placeholder crop:
  a bright living space with large windows).

leenaParwani.jpeg
  Used in: home.html, .founder-photo img
  Home page's "Founder" split section (photo left, dark bio panel right),
  directly below the hero. Portrait orientation, fills a min-height:640px
  column edge-to-edge — a confident, editorial portrait of Leena works
  best (matches the reference crop: seated, three-quarter framing, warm
  interior/architectural background). As-dropped filename, referenced
  directly rather than renamed.

Featureproperties/ (folder)
  Used in: home.html, .feature-card img (Feature Properties carousel,
  below the Founder section). Filenames are as-dropped by the uploader —
  referenced directly rather than renamed. Current mapping:
    1744800906394-853274353.jpeg → Palm/skyline-view apartment card
    1744799409119-304166344.jpg  → The Opus Penthouse card
    1744801798866-303325356.jpeg → Palm Jumeirah villa (night pool) card
    1744803008524-912670174.png  → Garden home (night pool) card
    1744804395478-266492069.jpg  → Waterfront villa card
  Cards are tall portrait crops (fixed height 620px desktop / 480px
  mobile) with a dark bottom gradient for the title/specs overlay —
  keep the lower third of any replacement image relatively uncluttered.

commenimages/dubai-selling-guide-9dpTt35i.png
  Used in: home.html, .curation-photo img ("Get A Personalised Curation"
  sign-up section, below Feature Properties). A pre-composited graphic
  (801x409, transparent-edge PNG) — interior shot + exterior building shot
  with a soft fade already baked into the left edge, designed to blend
  straight into the section's cream background with no extra crop/overlay
  needed. Displayed near-native size, right-aligned and bleeding to the
  viewport edge. As-dropped filename, referenced directly rather than
  renamed.

FEATUREDDEVELOPMENT/ (folder)
  Used in: home.html, .dev-slide img (Featured Development carousel,
  below the Curation sign-up section). Auto-advancing 3-slide carousel
  over a single development, all captioned "Aman Residences Dubai" in
  the bar at the bottom. Filenames are as-dropped by the uploader —
  referenced directly rather than renamed. Current mapping:
    1777883846332-774979557.jpg → living room, panoramic skyline, daytime
    1777883846813-262734492.jpg → same living room, night
    1777883847010-451571279.jpg → aerial exterior, beachfront towers
  Full-bleed banner, height clamp(420px,34vw,640px), object-fit:cover —
  wide/panoramic shots work best; keep the bottom ~25% relatively
  uncluttered for the title/specs bar's dark gradient.

leena/ (folder)
  Used in: home.html, .trust-track / .trust-row--center img (Trust Wall
  section, below Featured Development). Three-row marquee — top row
  auto-scrolls right, bottom row auto-scrolls left (both loop via a
  duplicated image set + CSS animation, pauses on hover), center row is
  static (2 portraits + "A Name You Can Trust" headline + 2 portraits).
  Filenames are as-dropped (images.jpeg, images (1).jpeg … images (8).jpeg)
  — referenced directly rather than renamed. All 9 files are portraits of
  Leena; "images (7).jpeg" (a podcast-style thumbnail with its own baked-in
  caption text, "Do you know how your Mind & Body Process Grief?") was
  deliberately excluded per instruction — it reads as a mismatched, unrelated
  promo tile next to plain portraits. The other 8 are reused/repeated
  across the three rows, which is normal for this marquee pattern. Tiles
  are fixed-size crops (300x200 top/bottom rows, 280x340 center row on
  desktop) — square-ish, front-facing portraits work best if adding more.

footerbgimg-ZVM1Y70n.png
  Used in: css/base.css, .footer-bg (shared by every page's standard footer)
  Full-bleed background behind the footer nav columns + WhatsApp card.
  As-dropped filename, referenced directly rather than renamed.
  NOTE: this photo carries a "Serenia Living" (third-party developer)
  watermark in one corner. Since background-position/cover crops
  differently by viewport, the overlay gradient (.footer-overlay) was
  deliberately darkened across its full height — not just top-weighted —
  so the watermark stays illegible wherever it lands rather than relying
  on crop alone. If a clean (unwatermarked, non-Serenia-branded) skyline/
  marina shot becomes available, swap it in under this same filename and
  the overlay can be lightened back up for more photo visibility.
