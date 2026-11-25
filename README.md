# Indrajith Bandara — Professional Portfolio

Production: [indrajithbandara.is-a.dev](https://indrajithbandara.is-a.dev/)

A framework-free terminal-inspired portfolio hosted on GitHub Pages from `main`. It uses HTML, CSS and vanilla JavaScript, with dark/light preferences stored locally. No build step is required for deployment.

## Architecture

- `index.html`: profile, education, credential directory, projects and contact.
- `assets/js/credentials.js`: directory, filtering, analytics, details and exports.
- `credentials.json`: historical public transcript records; `credential-descriptions.json`: privacy-filtered excerpts and expiration dates; `credly-public-snapshot.json`: public badge metadata; `credential-directory.json`: normalized public dataset.
- `assets/js/roadmap.js`: public GitHub API statistics; `assets/js/articles.js`: DEV article feed.
- `assets/css`: theme, responsive layout and credential styles.
- `tools/build-credentials.mjs`: deterministic transcript transformation; `tools/validate.mjs`: validation.
- `.github/workflows/portfolio-quality.yml`: continuous checks.

## Development

Serve the root with `python3 -m http.server 8000`; open `http://localhost:8000/`. Run `node tools/build-credentials.mjs` to regenerate the directory from the original transcript data. Run `node tools/validate.mjs` before committing.

See [credential data documentation](CREDENTIALS.md), [security reporting](SECURITY.md) and [change history](CHANGELOG.md). Do not publish private documents, identifiers or secrets. The contact interface opens an email client and does not send messages itself. The CV is intentionally excluded.

## Deployment

Changes merged to `main` are served by the existing GitHub Pages configuration. Preserve `CNAME`, `.nojekyll`, canonical metadata, robots and sitemap. Verify the public custom domain after deployment.
# Professional platform

## Professional recommendations (privacy-gated)

The homepage and `/recommendations/` contain only approved static HTML. Do not put the original LinkedIn CSV, private preview, approval ledger, or unapproved recommendation records inside this repository. Run from the repository root: `python3 tools/recommendations.py /absolute/private/Recommendations_Received.csv --private-dir /absolute/private/review`. Review the generated private HTML and ledger. An entry is publishable only when its exact content fingerprint is unchanged, the source state is VISIBLE, `publicationApproval` is `approved`, and a real republication basis is documented in `basis`. Mark up to six substantive, diverse approved entries as `featured: true`; none are automatically approved. Then run with `--ledger /absolute/private/review/recommendation-approval-ledger.json --publish`. The importer reports new, changed and removed records, resets changed/hidden records to pending, excludes removed records, and writes only approved static HTML. Increment the service worker cache version for every publication change. Previously copied or cached public content cannot be guaranteed erased from third-party devices. Run regression tests and confirm no private data is staged before committing.

The shared Technical Skills view uses 14 explicitly defined categories, matching public transcript domain labels or title/issuer/skill terms. Counts represent overlapping evidence, never proficiency scores. Details render when expanded; dashboard public API requests start near the relevant region.

`platform.html` provides a separate integrated workspace: dashboard, global search, safe simulated terminal, credential detail routes, issuer collections, learning/career timelines, inferred knowledge graph, evidence-based skills, public projects, public releases, writing, activity feed, business card, categorized contact and changelog. `Ctrl/Cmd+K` opens the shared palette. Theme and motion preferences are stored locally; public API samples use a ten-minute session cache with stale fallback. No API keys, user tracking or real shell execution are used.

`sw.js` caches only the explicit public asset allowlist and uses network-first retrieval; bump the cache version for content releases. The offline fallback cannot refresh external live records. The PWA manifest uses generated local icons; the QR encodes the official website. No private transcript or form submission data is cached. Public project releases and issuer links depend on verified public data; unsupported claims are omitted.
