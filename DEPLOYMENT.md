# Multi-Platform Deployment Architecture

The `main` branch of `indrajithbandara/indrajithbandara.github.io` is the single source of truth for all portfolio deployments.

## Hosting Platforms

| Platform | Production URL | Sync Mechanism | Indexing Policy |
| :--- | :--- | :--- | :--- |
| GitHub Pages (Primary) | `https://indrajithbandara.is-a.dev/` (`indrajithbandara.github.io` redirects) | Native GitHub Pages on `main` | Indexable (Canonical) |
| Cloudflare Pages | `https://indrajithbandara.pages.dev/` | Cloudflare GitHub App on `main` | `X-Robots-Tag: noindex, nofollow` (`_headers`) |
| Netlify | `https://indrajithbandara.netlify.app/` | Netlify GitHub App or `NETLIFY_BUILD_HOOK` | `X-Robots-Tag: noindex, nofollow` (`_headers`, `netlify.toml`) |
| Vercel | `https://indrajith-portfolio-weld.vercel.app/` | Vercel GitHub App or `VERCEL_DEPLOY_HOOK` | `X-Robots-Tag: noindex, nofollow` (`vercel.json`) |
| Surge | `https://indrajithbandara.surge.sh/` | GitHub Actions (`deploy-multi-platform.yml`) | Static mirror (free-tier HTTPS) |

## Secondary Redirect Domains

- `https://indrajithbandara.go-live.me/` (`indrajithbandara/portfolio-golive-redirect`) — Active HTML/canonical redirect to `https://indrajithbandara.is-a.dev/`.
- `https://indrajithbandara.is-pro.dev/` (`indrajithbandara/portfolio-domain-redirect`) — Configured with `CNAME` and `noindex` HTML redirect; verify DNS/TLS upstream status.
- `https://indrajithbandara.thedev.id/` (`indrajithbandara/portfolio-thedev-redirect`) — Pending `thedev-id/thedev.id#1413` merge.
- Email DNS (`is-a-dev/register#63142`) — Separate MX/SPF configuration; do not modify.

## Automated Sync & Quality Gate

1. Changes merge into `main` only after `Portfolio quality` passes.
2. `Multi-platform deployment & verification` (`.github/workflows/deploy-multi-platform.yml`) runs after `Portfolio quality` succeeds on `main`, on `workflow_dispatch`, and weekly on Mondays at 03:30 UTC.
3. `node tools/generate-version.mjs` writes `version.json` at build time without creating self-referencing commits.
4. `node tools/verify-deployments.mjs` verifies HTTP status, `#overview`, `36 published`, `sw.js` version, and critical assets across all platforms.

## Required GitHub Actions Secrets (Names Only)

- `SURGE_LOGIN` and `SURGE_TOKEN` — Required for automated Surge deployments.
- `NETLIFY_BUILD_HOOK` — Optional fallback if Netlify native GitHub integration is not linked.
- `VERCEL_DEPLOY_HOOK` — Optional fallback if Vercel native GitHub integration is not linked.

## Recovery & Rollback

- Revert the offending commit on `main` (`git revert <sha>`) and push; `Portfolio quality` validates the revert and triggers synchronized redeployments across all connected platforms.
- Individual failed mirrors can be retriggered independently via `workflow_dispatch` or provider dashboards without affecting `https://indrajithbandara.is-a.dev/`.
