# CLAUDE.md — apps/portal

Vite + React 19 portal for Hibi. Deploys to Vercel static site (`app.hibi.app`).

## Status

Currently a scaffold — placeholder routes only. Real implementation lands in a follow-up pass:
- Email-OTP login (Supabase Auth)
- Account info screen
- API key management UI (uses `/v1/account/keys`)
- Stats dashboard (uses `/v1/stats/*`)

## Layout

```
src/
  main.tsx          // React entry + router setup
  App.tsx           // shell with nav + <Outlet />
  routes/           // one component per placeholder page
  styles.css        // base styles (placeholder — adopt Torakaa tokens later)
```

## When implementing real screens

- Visual reference: `apps/design/`. Read CSS tokens from there or import `@hibi/types`-validated shapes.
- Use the **Supabase JS client** for auth flows (OTP `signInWithOtp`, `verifyOtp`).
- Once the portal has a Supabase session, hit `/v1/account/keys` with the JWT to manage keys.
- Cards/reviews/stats calls go through the API-key path or via `hibi-client`.

## Dev

```bash
pnpm --filter @hibi/portal dev   # http://localhost:5173
pnpm --filter @hibi/portal build
```
