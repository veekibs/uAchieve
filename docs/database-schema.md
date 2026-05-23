# UAchieve — Database Schema

**Stack:** PostgreSQL via Supabase · ORM: Prisma  
**Normalisation:** Third Normal Form (3NF)  
**Last updated:** May 2026

---

## Entities & Tables

### 1. `users`

Stores all registered users. Account is created automatically on first booking — no separate sign-up step before checkout.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | Supabase auth UID |
| `email` | `text` | UNIQUE, NOT NULL | Used for login and comms |
| `first_name` | `text` | NOT NULL | Stored separately for certificate generation |
| `last_name` | `text` | NOT NULL | Stored separately for certificate generation |
| `phone` | `text` | NULLABLE | Optional at booking |
| `company_name` | `text` | NULLABLE | Optional — for corporate bookings |
| `role` | `text` | NOT NULL, default `'student'` | `'student'` or `'admin'` — grandma is `'admin'` |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**RLS policies:**
- Users can only read/update their own row
- Admin can read all rows
- Insert allowed on booking creation (service role)

---

### 2. `courses`

Static course catalogue. Only two rows will ever exist: BLS and EFAW. Changes here propagate automatically to all sessions.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `title` | `text` | NOT NULL | "Basic Life Support" / "Emergency First Aid at Work" |
| `slug` | `text` | UNIQUE, NOT NULL | `'bls'` / `'efaw'` — used in URL routing |
| `description` | `text` | NOT NULL | Full course description |
| `duration_hours` | `int` | NOT NULL | 3 or 6 |
| `price` | `numeric(10,2)` | NOT NULL | In GBP — e.g. 85.00 |
| `badge_label` | `text` | NULLABLE | "Beginner Friendly" / "HSE Approved" |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**RLS policies:**
- Public read access (anyone can view courses)
- Only admin can insert/update/delete

---

### 3. `sessions`

Each row is a specific Saturday instance of a course at a specific venue.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `course_id` | `uuid` | FK → `courses.id`, NOT NULL | ON DELETE RESTRICT |
| `date` | `date` | NOT NULL | Always a Saturday |
| `start_time` | `time` | NOT NULL | e.g. `09:00:00` |
| `end_time` | `time` | NOT NULL | e.g. `12:00:00` |
| `venue_name` | `text` | NOT NULL | e.g. "Bedford Community Centre" |
| `venue_address` | `text` | NOT NULL | Full address |
| `max_capacity` | `int` | NOT NULL, default `12` | Hard cap — enforced at API level too |
| `is_active` | `boolean` | NOT NULL, default `true` | Grandma can deactivate without deleting |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**RLS policies:**
- Public read access for active sessions
- Only admin can insert/update/delete

---

### 4. `bookings`

The transactional core. Links a user to a session. Created immediately on payment intent, confirmed on webhook success.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `user_id` | `uuid` | FK → `users.id`, NOT NULL | ON DELETE RESTRICT |
| `session_id` | `uuid` | FK → `sessions.id`, NOT NULL | ON DELETE RESTRICT |
| `stripe_payment_intent_id` | `text` | UNIQUE, NULLABLE | Set on checkout init, used to match webhook |
| `transaction_id` | `text` | NULLABLE | Confirmed Stripe charge ID |
| `payment_status` | `text` | NOT NULL, default `'pending'` | `'pending'` / `'confirmed'` / `'refunded'` / `'cancelled'` |
| `attendance_status` | `text` | NOT NULL, default `'not_attended'` | `'not_attended'` / `'attended'` / `'no_show'` |
| `price_paid` | `numeric(10,2)` | NOT NULL | Locked at time of purchase — not derived from course price |
| `discount_code` | `text` | NULLABLE | Code used if any |
| `discount_amount` | `numeric(10,2)` | NULLABLE | Amount deducted in GBP |
| `booked_at` | `timestamptz` | NOT NULL, default `now()` | |
| `confirmed_at` | `timestamptz` | NULLABLE | Set when webhook confirms payment |

**RLS policies:**
- Users can only read their own bookings
- Admin can read all bookings
- Insert via service role only (API route)
- Update via service role only (webhook + admin attendance marking)

---

### 5. `certificates`

Generated after grandma marks attendance as `'attended'`. One certificate per booking.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK | |
| `booking_id` | `uuid` | FK → `bookings.id`, UNIQUE, NOT NULL | ON DELETE RESTRICT — 1:1 with booking |
| `user_id` | `uuid` | FK → `users.id`, NOT NULL | ON DELETE RESTRICT — denormalised for faster queries |
| `issue_date` | `date` | NOT NULL | Date attendance confirmed |
| `expiry_date` | `date` | NOT NULL | issue_date + 3 years |
| `pdf_url` | `text` | NULLABLE | Supabase Storage URL — set after PDF generation |
| `is_expired` | `boolean` | NOT NULL, default `false` | Updated by scheduled function |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**RLS policies:**
- Users can only read their own certificates
- Admin can read all certificates
- Insert/update via service role only

---

## Relationships Summary

```
courses ──< sessions ──< bookings >── users
                              │
                         certificates
```

| Relationship | Cardinality | Participation | Constraint |
|---|---|---|---|
| Course → Session | 1:N | Total on Session side | ON DELETE RESTRICT |
| Session → Booking | 1:N | Total on Booking side | ON DELETE RESTRICT |
| User → Booking | 1:N | Total on Booking side | ON DELETE RESTRICT |
| Booking → Certificate | 1:1 | Total on Certificate side | ON DELETE RESTRICT |
| User → Certificate | 1:N | Partial on User side | ON DELETE RESTRICT |

---

## Capacity Enforcement

The `max_capacity` of 12 is enforced at **two levels**:

1. **Database level:** A Postgres function counts existing confirmed bookings for a session before allowing an insert — prevents race conditions
2. **API level:** The booking route checks capacity before creating a Stripe payment intent — prevents unnecessary Stripe charges

```sql
-- Postgres function used in booking transaction
CREATE OR REPLACE FUNCTION check_session_capacity(session_uuid uuid)
RETURNS boolean AS $$
DECLARE
  current_count integer;
  max_cap integer;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM bookings
  WHERE session_id = session_uuid
  AND payment_status IN ('pending', 'confirmed');

  SELECT max_capacity INTO max_cap
  FROM sessions
  WHERE id = session_uuid;

  RETURN current_count < max_cap;
END;
$$ LANGUAGE plpgsql;
```

---

## Supabase Storage Buckets

| Bucket | Access | Contents |
|---|---|---|
| `certificates` | Private (RLS) | Generated PDF certificates |
| `course-images` | Public | Course listing photos |

Certificate files named: `cert_{booking_id}_{user_id}.pdf`

---

## Scheduled Functions (Supabase Edge Functions)

| Function | Schedule | Purpose |
|---|---|---|
| `update-expired-certs` | Daily at 00:00 UTC | Sets `is_expired = true` on certificates past expiry_date |
| `send-expiry-reminders` | Daily at 09:00 UTC | Emails users 60 days before certificate expiry |