# Changelog
## 2026-11-26 — Calm Obsidian Dark Mode & Calm Editorial Light Mode
- Centralized semantic design tokens (`--bg`, `--surface`, `--text`, `--text-dim`, `--accent`, `--border`) across `style.css`, `platform.css`, `credentials.css`, `recommendations.css`, and `404.css` for Calm Obsidian dark mode and Calm Editorial light mode, alongside Fluid Spatial Motion refinements.
## 2026-11-26 — Fluid Spatial Motion Experience
- Replaced the legacy terminal typing and cinematic trace animations with the new GPU-composited Fluid Spatial Motion system (masked typography reveals, scroll-driven spatial section transitions, desktop pointer-tracked surface spotlight, refined skills/recommendations motion, and reduced-motion/no-JS fallbacks).
  
## 2026-11-26

- Published all 36 LinkedIn recommendations after the owner confirmed republication permission. Six representative cards are featured; the archive preserves full original wording and historical attribution. Updated offline cache and optimized client-side filtering.

## 2026-11-25

- Added Voices of My Professional Network, a privacy-gated recommendations homepage section and static searchable archive. Unapproved LinkedIn records remain private; no original export is shipped.

- Introduced Cinematic Terminal scroll motion: section typography, staggered card entrances, emerald signature lines, quiet ambient accents, platform motion and progress tracking. Preserved native scrolling and reduced-motion behavior.

- Redesigned Technical Skills in both the homepage and platform with 14 evidence-based categories, expandable credential links and decorative motion. Deferred dashboard API requests and reused the credential dataset across views; stabilized the mobile header and added cross-browser and production performance checks.

- Added the integrated professional platform with search and command palette, simulated terminal, deep-linkable credentials, issuer directory, evidence-based skills, learning and career timelines, knowledge graph, project case studies, public repositories/releases, article research and activity views.
- Added local display preferences, reading progress, PWA and offline public cache, digital business card, categorized contact handoff and interactive changelog.

- Restored the terminal typing sequence and finite cursor/scroll-indicator motion. Added opt-in viewport reveals, staggered dynamic credential cards, accessible data-driven counters and micro-interactions. Content remains visible without JavaScript and respects reduced motion.

- Added a normalized public credential model, explicit unknown validity, multi-domain classification, detailed filtering, shareable URLs and detail dialogs.
- Reconciled 279 public Credly badge cards against the 280 transcript records with official image URLs and individual verification paths (including 18 expired and one explicitly unexpired credential).
- Added JSON and printable exports, improved CSV escaping, and removed obsolete backups from the published tree.
- Removed the unsupported partnership count, corrected vocational qualification dates, and replaced SVG sharing metadata with PNG.
- Moved DEV article rendering into an external script and tightened script CSP.
