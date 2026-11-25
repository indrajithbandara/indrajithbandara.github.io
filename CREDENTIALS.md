# Credential directory

`credentials.json` is the historical transcript dataset dated 2026-11-22. It is not a count of current certifications. The original transcript is not published. `credential-directory.json` is the derived public directory. Run `node tools/build-credentials.mjs` from the repository root to rebuild from the original dataset. Run `node tools/validate.mjs` to validate.

IDs derive from title, issuer, authorizing organization and issue date. The model deliberately uses null for unavailable dates, URLs, types, descriptions and synchronization time. Domains are inferred from title patterns and may overlap. Legacy badges are linked only when title and issuer are unambiguous; no title-only joins are performed. Public live count and synchronization timestamp remain null until a permitted authoritative source is validated. No scheduled scraping is enabled.
