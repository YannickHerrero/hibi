# @hibi/portal

Vite + React 19 web portal for Hibi. Hosts:

- Email-OTP login (Supabase Auth)
- Account info
- API key management (create, list, revoke)
- Stats dashboard (heatmap, retention, daily counts)

Deploys to `app.hibi.app` as a Vercel static site.

## Status

This package is currently a scaffold — routes exist as placeholders. The full UI lands in a follow-up pass.

## Dev

```bash
pnpm --filter @hibi/portal dev    # http://localhost:5173
pnpm --filter @hibi/portal build
```
