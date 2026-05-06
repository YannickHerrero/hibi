# What you need to do before deploy

1. Provision Supabase → fill `.env` from `.env.example` (DATABASE_URL, SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, API_KEY_PEPPER)
2. Generate the first Drizzle migration: `pnpm --filter @hibi/db db:generate` then `db:migrate`
3. Create Vercel projects for `api`, `portal`, `docs`, `design` and link them; add the 4 subdomains
4. Add `NPM_TOKEN` secret to the GitHub repo for the release workflow to publish `hibi-client`
5. Default branch on GitHub: it might be `main` — change it to `master` to match the local repo and the CI workflow triggers
6. Rotate the embedded PAT in your local `.git/config` (origin URL contains it in cleartext)
