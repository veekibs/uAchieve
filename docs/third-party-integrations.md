# UAchieve — Third Party Integrations

**Last updated:** May 2026

---

## 1. Stripe

**Purpose:** Payment processing, refunds, discount codes  
**Docs:** https://stripe.com/docs  
**Dashboard:** https://dashboard.stripe.com

### Setup
- Create Stripe account in client's name 
- Get API keys from Dashboard → Developers → API keys
- Set up webhook endpoint pointing to `https://uachieve.co.uk/api/webhooks/stripe`

### Webhook Events to Listen For

| Event | Handler |
|---|---|
| `payment_intent.succeeded` | Confirm booking, send confirmation email, pre-create certificate |
| `payment_intent.payment_failed` | Mark booking failed, send retry email |
| `charge.refunded` | Update booking status, send refund confirmation |

### Stripe Checkout Configuration

```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'gbp',
      product_data: {
        name: courseTitle,
        description: `${date} · ${startTime} · ${venueName}`,
      },
      unit_amount: priceInPence, // Stripe uses pence not pounds
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${baseUrl}/book/confirmation?booking_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/courses/${courseSlug}`,
  customer_email: userEmail,
  metadata: {
    booking_id: bookingId,   // CRITICAL — used to match webhook to booking
    session_id: sessionId,
    user_id: userId,
  },
})
```

### Discount Codes
- Create coupon codes in Stripe Dashboard → Products → Coupons
- OR validate manually in `/api/discount/validate` and apply via `discounts` param in Checkout

### Refunds
```typescript
await stripe.refunds.create({
  payment_intent: paymentIntentId,
  amount: refundAmountInPence, // partial refund for 50% policy
})
```

### Test Cards
| Card | Result |
|---|---|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0027 6000 3184` | 3D Secure required |

---

## 2. Supabase

**Purpose:** PostgreSQL database, Auth, Storage  
**Docs:** https://supabase.com/docs  
**Dashboard:** https://supabase.com/dashboard

### Services Used

| Service | Purpose |
|---|---|
| PostgreSQL | All application data |
| Auth | User accounts, sessions, password reset |
| Storage | Certificate PDFs, course images |
| Edge Functions | Scheduled jobs (expiry reminders) |

### Storage Buckets

| Bucket | Public | Purpose |
|---|---|---|
| `certificates` | No (private) | Generated PDF certificates |
| `course-images` | Yes | Course listing + detail photos |

### Signed URL for Certificate Download
```typescript
const { data } = await supabase.storage
  .from('certificates')
  .createSignedUrl(`cert_${bookingId}_${userId}.pdf`, 60) // 60 second expiry
```

---

## 3. Resend

**Purpose:** Transactional emails  
**Docs:** https://resend.com/docs  
**Dashboard:** https://resend.com

### Email Templates Needed

| Template | Trigger | Recipients |
|---|---|---|
| Booking confirmation | `payment_intent.succeeded` webhook | Student |
| Payment failed | `payment_intent.payment_failed` webhook | Student |
| Certificate ready | Admin marks attendance | Student |
| Certificate expiry reminder | Scheduled function (60 days before) | Student |
| Cancellation confirmation | Student cancels booking | Student |
| Refund confirmation | Refund processed | Student |
| Set your password | New account created during booking | Student |

### Basic Usage
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'UAchieve First Aid <noreply@u-achieve.co.uk>',
  to: userEmail,
  subject: 'Your booking is confirmed!',
  html: bookingConfirmationTemplate(bookingDetails),
})
```

### Domain Setup
- Add u-achieve.co.uk to Resend → add DNS records to domain registrar
- Verify domain before going live or emails go to spam

---

## 4. CookieYes

**Purpose:** UK GDPR cookie consent banner  
**Docs:** https://www.cookieyes.com/documentation  
**Free plan:** Yes — sufficient for UAchieve

### Setup
1. Sign up at cookieyes.com
2. Add your domain
3. Copy the script tag
4. Add to `app/layout.tsx` in `<head>`

```html
<script
  id="cookieyes"
  type="text/javascript"
  src="https://cdn-cookieyes.com/client_data/YOUR_ID/script.js"
/>
```

### Why Needed
UAchieve uses Stripe (sets cookies) and potentially analytics. UK GDPR requires explicit consent for non-essential cookies. CookieYes handles the banner, consent storage, and compliance logging automatically.

---

## 5. Vercel

**Purpose:** Hosting + deployment  
**Docs:** https://vercel.com/docs  
**Free tier:** Sufficient for UAchieve

### Setup
1. Push project to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Point domain DNS to Vercel nameservers

### Deployment Flow
- Every push to `main` → automatic production deploy
- Every pull request → preview deploy at unique URL (useful for testing)

### Environment Variables
Set in Vercel Dashboard → Project → Settings → Environment Variables (see environment-variables.md)

---

## Integration Architecture

```
User browser
    │
    ▼
Next.js (Vercel)
    │
    ├── Supabase (database + auth + storage)
    ├── Stripe (payments)
    │       │
    │       └── Stripe Webhook → /api/webhooks/stripe
    ├── Resend (emails)
    └── CookieYes (consent banner, client-side only)
```