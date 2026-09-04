/* Shared across every page that needs project data (projects.html,
   project.html, index.html's Project of Focus cards, developers.html).

   There's no build step on this site, so project listings aren't baked
   into the HTML — they're fetched at runtime from content/projects/*.json
   in this same GitHub repo, via GitHub's public Contents API (works
   without auth for a public repo; this is also exactly where Decap CMS
   writes when a project is added/edited/deleted through the admin, so
   the site always reflects whatever's currently in the repo).

   Cached in sessionStorage for 10 minutes so navigating between pages
   in one visit doesn't re-fetch all 10 files — unauthenticated GitHub
   API calls are rate-limited to 60/hour per IP, which is comfortably
   enough for this site's traffic but not worth spending needlessly. */
(function () {
  const REPO = 'AjuFrancisAnchanattu/silverspoon-properties-site';
  const CONTENT_PATH = 'content/projects';
  const CACHE_KEY = 'ssp-projects-cache-v1';
  const CACHE_TTL_MS = 10 * 60 * 1000;

  async function fetchProjects() {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL_MS) return data;
      } catch (e) { /* ignore bad cache, refetch */ }
    }

    const listRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${CONTENT_PATH}`);
    if (!listRes.ok) throw new Error(`Could not list projects (${listRes.status})`);
    const files = (await listRes.json()).filter(f => f.name.endsWith('.json'));

    const projects = await Promise.all(
      files.map(f => fetch(f.download_url).then(r => r.json()))
    );

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: projects, ts: Date.now() }));
    } catch (e) { /* storage full/unavailable — fine, just skip caching */ }

    return projects;
  }

  async function fetchProject(id) {
    const projects = await fetchProjects();
    return projects.find(p => p.id === id) || null;
  }

  window.SSPProjects = { fetchProjects, fetchProject };
})();
