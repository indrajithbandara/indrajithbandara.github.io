# Multi-Platform Deployment & Synchronization Guide

## Architecture & Single Source of Truth

The `main` branch of `indrajithbandara/indrajithbandara.github.io` is the single source of truth for all deployments. All changes are merged to `main` via pull request and automatically validated before multi-platform synchronization runs.

### Hosting Platforms

| Platform | Domain | Role | Sync Mechanism |
| --- | --- | --- | --- |
| **GitHub Pages** | `indrajithbandara.is-a.dev` | Primary canonical host | GitHub Pages deployment from `main` |
| **Cloudflare Pages** | `indrajithbandara.pages.dev` | Secondary mirror | Cloudflare Pages GitHub integration on `main` |
| **Netlify** | `indrajithbandara.netlify.app` | Secondary mirror | Netlify GitHub integration / optional `NETLIFY_BUILD_HOOK` |
| **Vercel** | `indrajith-portfolio-weld.vercel.app` | Secondary mirror | Vercel GitHub integration / optional `VERCEL_DEPLOY_HOOK` |
| **Surge** | `indrajithbandara.surge.sh` | Secondary mirror | GitHub Actions (`npx surge`) via `SURGE_LOGIN` & `SURGE_TOKEN` |

### Redirect Domains

The following domains redirect to the primary canonical host (`indrajithbandara.is-a.dev`):

- `indrajithbandara.is-pro.dev` (active redirect)
- `indrajithbandara.go-live.me` (active redirect)
- `indrajithbandara.thedev.id` (pending)

## Automated Synchronization Workflow

Synchronization is orchestrated by `.github/workflows/deploy-multi-platform.yml` (**Multi-platform deployment & verification**):

1. **Trigger**: Runs automatically on `workflow_run` when **Portfolio quality** completes with `success` on `main`.
2. **Schedule & Manual Run**: Also runs weekly on Mondays at `03:30 UTC` (`cron: '30 3 * * 1'`) and on demand via `workflow_dispatch`.
3. **Version Manifest**: Executes `node tools/generate-version.mjs` to generate the deployment version manifest.
4. **Platform Sync**:
   - Deploys to Surge (`indrajithbandara.surge.sh`) if `SURGE_LOGIN` and `SURGE_TOKEN` are configured.
   - Triggers `NETLIFY_BUILD_HOOK` if configured (otherwise relies on Netlify GitHub integration).
   - Triggers `VERCEL_DEPLOY_HOOK` if configured (otherwise relies on Vercel GitHub integration).
5. **Verification**: Executes `node tools/verify-deployments.mjs` and writes the verification summary to `$GITHUB_STEP_SUMMARY`.

## GitHub Actions Secrets

Configure the following repository secrets under **Settings -> Secrets and variables -> Actions** (names only; never commit secret values):

- `SURGE_LOGIN` — Surge account email used to publish to `indrajithbandara.surge.sh`.
- `SURGE_TOKEN` — Surge authentication token (`surge token`).
- `NETLIFY_BUILD_HOOK` *(optional)* — Netlify build hook URL to trigger deploys from Actions.
- `VERCEL_DEPLOY_HOOK` *(optional)* — Vercel deploy hook URL to trigger deploys from Actions.

## SEO Protection on Secondary Hosts

To prevent duplicate-content indexing while keeping `indrajithbandara.is-a.dev` as the canonical domain, secondary hosts serve:

```
X-Robots-Tag: noindex, nofollow
```

- **Cloudflare Pages & Netlify**: Configured in `_headers`.
- **Vercel**: Configured in `vercel.json`.

## Tooling Scripts

- `tools/generate-version.mjs` — Generates the deployment version manifest used to confirm every mirror is serving the latest commit.
- `tools/verify-deployments.mjs` — Checks HTTP status, version manifest alignment, security/SEO headers, and redirect targets across all 5 hosting platforms and redirect domains.

## Troubleshooting

- **Surge step skipped**: Ensure both `SURGE_LOGIN` and `SURGE_TOKEN` are set in GitHub Actions secrets.
- **Netlify or Vercel out of sync**: Confirm GitHub app permissions on the repository or add `NETLIFY_BUILD_HOOK` / `VERCEL_DEPLOY_HOOK` secrets so the workflow triggers builds explicitly.
- **Verification mismatch immediately after merge**: Secondary platforms may take a few minutes to finish building; re-run **Multi-platform deployment & verification** via `workflow_dispatch` once builds settle.
- **Pending redirect (`indrajithbandara.thedev.id`)**: Verify DNS/redirect provisioning status before treating failures on this domain as regressions.

## Rollback & Recovery

- **Standard rollback**: Run `git revert <commit-sha>` on `main` (via PR or direct revert) so **Portfolio quality** and **Multi-platform deployment & verification** automatically propagate the reverted state to all 5 platforms.
- **Platform-specific recovery**: Redeploy the previous known-good commit from the respective platform dashboard (GitHub Pages, Cloudflare Pages, Netlify, Vercel) or check out the target commit and run `npx surge --project . --domain indrajithbandara.surge.sh` for Surge.

## Free-Tier Limitations

- **GitHub Actions**: Standard public repository runner minutes and 10-minute job timeout apply.
- **Cloudflare Pages / Netlify / Vercel**: Subject to free-tier monthly build minutes, bandwidth quotas, and concurrent build limits; frequent commits to `main` may queue builds.
- **Surge**: Free tier supports static hosting on `*.surge.sh` without custom-domain SSL or server-side `_headers` processing.
