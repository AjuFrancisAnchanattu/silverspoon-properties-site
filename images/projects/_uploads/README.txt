Shared media library for the CMS (admin/config.yml's media_folder).

Every image/PDF uploaded through the admin panel — for any project,
via any field (hero image, gallery, floor plans, brochure) — lands
here, not in that project's own images/projects/<slug>/ folder. That's
a deliberate fix, not the original design: a per-project folder using
a {{slug}} template looked right but didn't resolve correctly in
practice (see the comment above media_folder in admin/config.yml for
what went wrong), so this shared folder replaced it — no templating
to get wrong, so every upload is guaranteed to land somewhere real.

This means: after uploading a photo through the CMS, its real file
sits here (e.g. images/projects/_uploads/villa-render.jpg), while the
project's JSON field correctly points at that path. Nothing else to
do — this is just where to look if you ever need to find an uploaded
file directly instead of through the CMS.
