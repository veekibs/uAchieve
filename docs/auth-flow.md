# UAchieve — Auth Flow

**Provider:** Supabase Auth  
**Strategy:** Email + Password (no OAuth, no magic link for MVP)  
**Last updated:** May 2026

---

## Core Principle

There is **no separate sign-up page**. Accounts are created automatically during the booking checkout flow using the email the customer provides. This removes friction from the purchase journey — first-time visitors go straight from landing to booking without creating an account first.

---

## User Journey & Auth States

### First-time booking (new user)

```
1. User fills in details on booking step 1
   (first name, last name, email, phone)

2. POST /api/bookings is called

3. API checks if a user exists with that email
   → If NO: create Supabase auth user + users table row
             send "set your password" email via Supabase Auth
   → If YES: use existing user ID

4. Booking created, Stripe checkout initiated

5. On payment success (webhook):
   → Booking confirmed
   → Confirmation email sent (includes link to set password / access portal)

6. User clicks link, sets password, accesses profile
```

### Returning user (existing account)

```
1. User clicks "Login" in nav
2. Lands on /login page
3. Enters email + password
4. Supabase Auth verifies credentials
5. Session cookie set
6. Redirected to /profile (certificates tab)
```

---

## Protected Routes

These routes require a valid Supabase session. Middleware checks auth on every request.

| Route | Required role | Redirect if not authed |
|---|---|---|
| `/profile` | `student` or `admin` | `/login` |
| `/profile/bookings` | `student` or `admin` | `/login` |
| `/profile/settings` | `student` or `admin` | `/login` |
| `/admin` | `admin` only | `/` (homepage) |
| `/admin/sessions/[id]` | `admin` only | `/` (homepage) |

---

## Middleware (`middleware.ts`)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Protected routes — require any auth
  const protectedPaths = ['/profile']
  const adminPaths = ['/admin']

  const isProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p))
  const isAdmin = adminPaths.some(p => req.nextUrl.pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdmin) {
    if (!session) return NextResponse.redirect(new URL('/', req.url))
    // Check role — fetch from users table
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*', '/admin/:path*']
}
```

---

## Admin Setup

Grandma's admin account is set up manually — not through the booking flow.

1. Create her Supabase auth account via Supabase dashboard
2. Insert her user row manually with `role: 'admin'`
3. She logs in via the normal `/login` page
4. Middleware detects `role: 'admin'` and grants access to `/admin`

She will never appear as a student. She cannot book courses through the public flow.

---

## Password Reset Flow

Standard Supabase password reset:

1. User clicks "Forgot password" on `/login`
2. Enters email
3. Supabase sends reset email with magic link
4. User clicks link → lands on `/reset-password`
5. Sets new password
6. Redirected to `/profile`

---

## Session Management

- Sessions stored as HTTP-only cookies via Supabase Auth helpers
- Session expires after 1 week of inactivity
- Refresh tokens handled automatically by Supabase
- On logout: `supabase.auth.signOut()` clears cookie and redirects to `/`

---

## Supabase Clients

Two separate clients — one for browser, one for server:

**Browser client** (`lib/supabase/client.ts`):
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export const supabase = createClientComponentClient()
```

**Server client** (`lib/supabase/server.ts`):
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
export const getSupabaseServer = () =>
  createServerComponentClient({ cookies })
```

Use the **server client** in Server Components and API routes.
Use the **browser client** in Client Components only.

---

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser — server/API routes only
- Row Level Security (RLS) is enabled on all tables — see database-schema.md
- Certificate download URLs are signed with 60-second expiry — cannot be shared
- Admin role check happens at middleware level AND at individual API routes (defence in depth)
- Stripe webhook uses signature verification not JWT — keep `STRIPE_WEBHOOK_SECRET` secure