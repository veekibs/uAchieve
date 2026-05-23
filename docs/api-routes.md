# UAchieve — API Routes

**Framework:** Next.js 14 App Router (Route Handlers)  
**Base path:** `/api`  
**Auth:** Supabase JWT — passed via `Authorization: Bearer <token>` header or cookie  
**Last updated:** May 2026

---

## Route Overview

| Method | Path | Auth required | Description |
|---|---|---|---|
| GET | `/api/sessions` | No | List available sessions |
| GET | `/api/sessions/[id]` | No | Get single session + availability |
| POST | `/api/bookings` | No* | Create booking + Stripe payment intent |
| GET | `/api/bookings` | Yes (student) | Get current user's bookings |
| PATCH | `/api/bookings/[id]/cancel` | Yes (student) | Cancel a booking |
| POST | `/api/webhooks/stripe` | No (Stripe sig) | Handle Stripe payment events |
| POST | `/api/certificates/unlock` | Yes (admin) | Mark attended + generate certificate |
| GET | `/api/certificates` | Yes (student) | Get current user's certificates |
| GET | `/api/certificates/[id]/download` | Yes (student) | Get signed URL for PDF download |
| POST | `/api/discount/validate` | No | Validate a discount code |
| GET | `/api/admin/sessions` | Yes (admin) | List all sessions for dashboard |
| GET | `/api/admin/sessions/[id]/attendees` | Yes (admin) | Get attendee list for a session |
| PATCH | `/api/admin/sessions/[id]` | Yes (admin) | Update session details |

*Account created during booking if user doesn't exist

---

## Detailed Route Specs

---

### `GET /api/sessions`

Returns all upcoming active sessions grouped by course.

**Query params:**
- `course_id` (optional) — filter by course
- `from` (optional) — date string, default today

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "course_title": "Basic Life Support",
      "course_slug": "bls",
      "date": "2026-05-17",
      "start_time": "09:00",
      "end_time": "12:00",
      "venue_name": "Bedford Community Centre",
      "venue_address": "123 High Street, Bedford, MK40 1AA",
      "max_capacity": 12,
      "spots_remaining": 7,
      "price": 85.00,
      "is_available": true
    }
  ]
}
```

**Response 500:**
```json
{ "error": "Failed to fetch sessions" }
```

---

### `GET /api/sessions/[id]`

Returns a single session with full details and current availability.

**Response 200:** Single session object (same shape as above)

**Response 404:**
```json
{ "error": "Session not found" }
```

---

### `POST /api/bookings`

Creates a booking record and returns a Stripe Checkout session URL. If the user doesn't have an account, one is created using their email.

**Request body:**
```json
{
  "session_id": "uuid",
  "first_name": "Sarah",
  "last_name": "Jones",
  "email": "sarah@example.com",
  "phone": "07700900000",
  "company_name": "Acme Ltd",
  "discount_code": "SAVE10",
  "course_type": "first_time"
}
```

**Logic (order matters):**
1. Validate all required fields
2. Validate discount code if provided
3. Check session exists and is active
4. **Atomically check capacity** — if session is full, return 409
5. Look up or create user by email
6. Calculate final price (base price minus discount)
7. Create booking row with `payment_status: 'pending'`
8. Create Stripe Checkout session with booking ID in metadata
9. Return Stripe checkout URL

**Response 200:**
```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "booking_id": "uuid"
}
```

**Response 409 (session full):**
```json
{ "error": "This session is fully booked. Please choose another date." }
```

**Response 400 (validation):**
```json
{ "error": "Email address is required" }
```

**Response 500:**
```json
{ "error": "Failed to create booking. Please try again." }
```

---

### `GET /api/bookings`

Returns all bookings for the authenticated user, split into upcoming and past.

**Auth:** Required — Supabase JWT

**Response 200:**
```json
{
  "upcoming": [
    {
      "id": "uuid",
      "session": {
        "date": "2026-05-17",
        "start_time": "09:00",
        "end_time": "12:00",
        "venue_name": "Bedford Community Centre"
      },
      "course_title": "Basic Life Support",
      "payment_status": "confirmed",
      "attendance_status": "not_attended",
      "price_paid": 85.00,
      "booked_at": "2026-04-20T14:32:00Z"
    }
  ],
  "past": [...]
}
```

---

### `PATCH /api/bookings/[id]/cancel`

Cancels a booking and processes refund according to cancellation policy.

**Auth:** Required — must own the booking

**Logic:**
1. Verify booking belongs to authenticated user
2. Check booking is in `confirmed` status
3. Calculate days until session
4. Apply cancellation policy:
   - 14+ days: full refund via Stripe
   - 7-13 days: 50% refund via Stripe
   - <7 days: no refund, rebooking only
5. Update booking `payment_status` to `'cancelled'`
6. Send cancellation confirmation email via Resend

**Response 200:**
```json
{
  "message": "Booking cancelled successfully",
  "refund_amount": 85.00,
  "refund_policy": "full"
}
```

**Response 403:**
```json
{ "error": "You are not authorised to cancel this booking" }
```

**Response 400:**
```json
{ "error": "This booking cannot be cancelled — less than 7 days until the course date. Please contact us to discuss rebooking." }
```

---

### `POST /api/webhooks/stripe`

Handles incoming Stripe webhook events. This is the most critical route — it's what confirms a payment is real.

**Auth:** Stripe webhook signature verification (not JWT)

**Headers required:**
- `stripe-signature` — verified against `STRIPE_WEBHOOK_SECRET`

**Events handled:**

#### `payment_intent.succeeded`
1. Extract `booking_id` from payment intent metadata
2. Update booking: `payment_status → 'confirmed'`, `confirmed_at → now()`, `transaction_id → charge_id`
3. Send booking confirmation email via Resend (with session details + venue)
4. Pre-create certificate row with `pdf_url: null` (unlocked later by admin)

#### `payment_intent.payment_failed`
1. Update booking: `payment_status → 'failed'`
2. Send payment failed email with retry link

#### `charge.refunded`
1. Update booking: `payment_status → 'refunded'`
2. Send refund confirmation email

**Response 200:**
```json
{ "received": true }
```

**Response 400 (bad signature):**
```json
{ "error": "Webhook signature verification failed" }
```

**IMPORTANT:** Always return 200 even if processing fails internally — log the error but don't let Stripe retry indefinitely. Handle idempotency.

---

### `POST /api/certificates/unlock`

Admin-only. Marks a student as attended and triggers PDF certificate generation.

**Auth:** Required — admin role only

**Request body:**
```json
{
  "booking_id": "uuid"
}
```

**Logic:**
1. Verify caller is admin
2. Verify booking exists and is `confirmed`
3. Update booking `attendance_status → 'attended'`
4. Generate certificate PDF (student name, course, issue date, expiry date, UAchieve branding)
5. Upload PDF to Supabase Storage `certificates` bucket
6. Update certificate row: `pdf_url → storage_url`, `issue_date → today`, `expiry_date → today + 3 years`
7. Send "your certificate is ready" email to student via Resend

**Response 200:**
```json
{
  "message": "Certificate issued successfully",
  "certificate_id": "uuid"
}
```

**Response 403:**
```json
{ "error": "Admin access required" }
```

---

### `GET /api/certificates/[id]/download`

Returns a short-lived signed URL for secure PDF download. Signed URLs expire after 60 seconds — student must download immediately.

**Auth:** Required — must own the certificate

**Logic:**
1. Verify certificate belongs to authenticated user
2. Generate Supabase Storage signed URL (60 second expiry)
3. Return URL

**Response 200:**
```json
{
  "download_url": "https://supabase-storage-url/signed/...",
  "expires_in": 60
}
```

**Response 403:**
```json
{ "error": "You are not authorised to access this certificate" }
```

---

### `POST /api/discount/validate`

Validates a discount code without creating a booking. Called on blur from the discount code input.

**Request body:**
```json
{ "code": "SAVE10", "session_id": "uuid" }
```

**Response 200 (valid):**
```json
{
  "valid": true,
  "code": "SAVE10",
  "discount_type": "percentage",
  "discount_value": 10,
  "discount_amount": 8.50,
  "final_price": 76.50
}
```

**Response 200 (invalid):**
```json
{
  "valid": false,
  "error": "Invalid or expired discount code"
}
```

---

### `GET /api/admin/sessions/[id]/attendees`

Returns the full attendee list for a session — used in grandma's admin dashboard for check-in.

**Auth:** Required — admin role only

**Response 200:**
```json
{
  "session": {
    "id": "uuid",
    "date": "2026-05-17",
    "course_title": "Basic Life Support",
    "venue_name": "Bedford Community Centre",
    "spots_remaining": 4
  },
  "attendees": [
    {
      "booking_id": "uuid",
      "first_name": "Sarah",
      "last_name": "Jones",
      "email": "sarah@example.com",
      "phone": "07700900000",
      "company_name": null,
      "payment_status": "confirmed",
      "attendance_status": "not_attended",
      "price_paid": 85.00
    }
  ]
}
```

---

## Error Handling Standards

All routes follow this error response shape:

```json
{ "error": "Human readable message" }
```

All errors are logged server-side with:
- Route path
- Error message
- Stack trace (dev only)
- User ID if authenticated
- Timestamp

Never expose raw database errors or stack traces to the client.

---

## Rate Limiting

Apply rate limiting to these routes to prevent abuse:

| Route | Limit |
|---|---|
| `POST /api/bookings` | 5 requests / 10 min per IP |
| `POST /api/discount/validate` | 20 requests / min per IP |
| `POST /api/webhooks/stripe` | No limit (Stripe IPs only) |