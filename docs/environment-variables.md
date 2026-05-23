# UAchieve — Environment Variables

**Last updated:** May 2026

---

## Setup

Create a `.env.local` file in the project root. **Never commit this file to git.**  
Add `.env.local` to `.gitignore` immediately.

For production: add all variables to Vercel Dashboard → Project → Settings → Environment Variables.

---

## All Variables

```bash
# ─── SUPABASE ───────────────────────────────────────────────
# Found in: Supabase Dashboard → Project Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# Public — safe to expose to browser

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Public — safe to expose to browser, but RLS protects data

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# PRIVATE — never expose to browser
# Used in: API routes that bypass RLS (booking creation, webhook handler)

# ─── STRIPE ─────────────────────────────────────────────────
# Found in: Stripe Dashboard → Developers → API Keys

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# Public — safe to expose to browser
# Use pk_test_... for development

STRIPE_SECRET_KEY=sk_live_...
# PRIVATE — never expose to browser
# Use sk_test_... for development

STRIPE_WEBHOOK_SECRET=whsec_...
# PRIVATE — found in Stripe Dashboard → Webhooks → your endpoint
# Used to verify incoming webhook requests are genuinely from Stripe

# ─── RESEND ─────────────────────────────────────────────────
# Found in: Resend Dashboard → API Keys

RESEND_API_KEY=re_...
# PRIVATE — never expose to browser

# ─── APP CONFIG ─────────────────────────────────────────────

NEXT_PUBLIC_BASE_URL=https://uachieve.co.uk
# Used to construct absolute URLs (e.g. Stripe success/cancel URLs)
# Use http://localhost:3000 in development

NEXT_PUBLIC_APP_NAME=UAchieve First Aid
# Used in email templates and page titles
```

---

## Development vs Production

| Variable | Development value | Production value |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | `pk_live_...` |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | `https://uachieve.co.uk` |
| All Supabase keys | Same project OR separate dev project | Production project |

**Recommendation:** Create a separate Supabase project for development so you're not polluting the production database with test data.

---

## Stripe Webhook Local Testing

Stripe webhooks won't reach localhost. Use the Stripe CLI to forward events:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This gives you a webhook secret for local testing — add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_... (the one the CLI gives you)
```

---

## Security Rules

- `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — use only in server-side API routes, never in components
- `STRIPE_SECRET_KEY` gives full Stripe account access — keep secret
- `STRIPE_WEBHOOK_SECRET` prevents webhook spoofing — always verify signatures
- Never log environment variables even in development
- Never put real keys in comments, documentation, or commit messages