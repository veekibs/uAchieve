# UAchieve — Component Map

**Framework:** Next.js 14 App Router  
**Styling:** Tailwind CSS  
**Last updated:** May 2026

---

## Component → API Route Map

| Component | API route(s) called | Notes |
|---|---|---|
| `Hero.tsx` | None | Static content |
| `CourseCards.tsx` | `GET /api/sessions` | Shows spots remaining |
| `StatsBar.tsx` | None | Static content |
| `WhyChoose.tsx` | None | Static content |
| `Accreditations.tsx` | None | Static logos |
| `BookingSidebar.tsx` | `GET /api/sessions/[id]` | Live availability |
| `DatePicker.tsx` | `GET /api/sessions` | Available Saturdays |
| `DetailsForm.tsx` | `POST /api/discount/validate` | On discount code blur |
| `DetailsForm.tsx` → submit | `POST /api/bookings` | Creates booking + Stripe session |
| `PaymentForm.tsx` | Stripe.js (client-side) | Stripe Elements |
| `Confirmation.tsx` | None | Reads URL params from Stripe redirect |
| `CertificateCard.tsx` | `GET /api/certificates/[id]/download` | On download button click |
| `BookingRow.tsx` | `PATCH /api/bookings/[id]/cancel` | On cancel click |
| `NotificationToggle.tsx` | `PATCH /api/users/notifications` | On toggle change |
| `AdminAttendeeList.tsx` | `GET /api/admin/sessions/[id]/attendees` | On page load |
| `AttendanceToggle.tsx` | `POST /api/certificates/unlock` | On mark attended click |

---

## Component Architecture

### Layout Components (shared across all pages)

```
components/layout/
├── Navbar.tsx
│   ├── glassmorphism sticky header
│   ├── reads auth state (show Login vs Logout)
│   └── shows "Book a Course" or "Contact Us" CTA depending on page
│
└── Footer.tsx
    └── static — four column layout
```

### UI Primitives (reusable across all components)

```
components/ui/
├── Button.tsx
│   ├── variants: primary (green), secondary (blue), ghost, danger
│   └── sizes: sm, md, lg
│
├── Input.tsx
│   ├── with label, placeholder, error state
│   └── focus: blue border + glow
│
├── Badge.tsx
│   └── variants: green (beginner), blue (HSE), amber (expiring), red (expired)
│
├── Card.tsx
│   └── glassmorphism variant available
│
├── Modal.tsx
│   └── with backdrop, escape key close, focus trap
│
├── Toast.tsx
│   └── success (green), error (red), info (blue) — auto-dismiss 3s
│
└── Accordion.tsx
    └── animated max-height expand/collapse
```

### Home Page Components

```
components/home/
├── Hero.tsx
│   ├── split layout: text left, image right
│   ├── dual CTA: "Browse Courses" (green) + "Learn More" (ghost)
│   └── trust badges: HSE · Resuscitation Council UK · Max 12
│
├── StatsBar.tsx
│   └── dark background: 30+ Years · 100% Accredited · Max 12 · 3 Years
│
├── CourseCards.tsx
│   ├── fetches sessions on load
│   ├── filter tabs: All / For Beginners / Refresher
│   ├── shows spots remaining per session
│   └── card hover: lift + button colour change
│
├── WhyChoose.tsx
│   └── three feature cards with icon, title, description
│
└── Accreditations.tsx
    └── greyscale logos, colour on hover
```

### Course Components

```
components/courses/
├── CourseDetail.tsx
│   └── orchestrates the course detail page layout
│
├── BookingSidebar.tsx
│   ├── sticky right column
│   ├── price display
│   ├── date picker (DatePicker.tsx)
│   ├── time slot selector
│   ├── "Book Now" CTA → navigates to /book with session_id
│   └── trust signals: instant confirmation, free cancellation, same-day cert
│
├── DatePicker.tsx
│   ├── inline mini calendar
│   ├── highlights available Saturdays in blue
│   ├── selected date: solid blue
│   ├── full sessions: strikethrough
│   └── unavailable/past: greyed out
│
└── WhatYoullLearn.tsx
    └── two-column bullet grid with animated green checkmarks
```

### Booking Flow Components

```
components/booking/
├── StepIndicator.tsx
│   └── three steps: numbered circles + connecting line
│       completed → green checkmark
│       active → blue number
│       upcoming → grey number
│
├── DetailsForm.tsx (Step 1)
│   ├── fields: first name, last name, email, phone, company (optional)
│   ├── course type radio: First Time / Refresher
│   ├── discount code: inline validate on blur
│   ├── T&Cs checkbox
│   └── "Continue to Payment" → POST /api/bookings
│
├── PaymentForm.tsx (Step 2)
│   ├── Stripe Elements card input
│   ├── Klarna option tab
│   ├── Back button
│   └── "Complete Booking" → Stripe confirm payment
│
├── OrderSummary.tsx (shared Steps 1 + 2)
│   ├── sticky sidebar
│   ├── course image, title, badge
│   ├── date, time, venue
│   ├── price breakdown (fee, discount, total)
│   └── "Secured by Stripe" trust line
│
└── Confirmation.tsx (Step 3)
    ├── animated green checkmark
    ├── booking reference
    ├── what's next numbered list
    ├── add to calendar links
    └── "Return to Home" + "View My Bookings" CTAs
```

### Profile Components

```
components/profile/
├── CertificateCard.tsx
│   ├── active: certificate preview, download + share buttons
│   └── expired: compact row, "Book Refresher" CTA
│
├── BookingRow.tsx
│   ├── upcoming: date block, course info, "Cancel Booking" link
│   └── past: compact, "View Certificate" link
│
└── NotificationToggle.tsx
    └── label + toggle switch, PATCH on change
```

### Admin Components

```
components/admin/
├── AdminSessionList.tsx
│   └── upcoming sessions, spots remaining, link to attendee list
│
└── AdminAttendeeList.tsx
    ├── list of confirmed students for a session
    ├── attendance toggle per student
    └── on mark attended → POST /api/certificates/unlock
```

---

## State Management

No global state library (no Redux, no Zustand). State is managed:

| Type | Approach |
|---|---|
| Server data | Next.js Server Components + fetch |
| Auth state | Supabase Auth context |
| Booking flow state | URL params + local component state |
| Form state | React useState (no form library for MVP) |
| Toast notifications | Simple context provider |

---

## Booking Flow State Between Steps

The booking flow passes state via URL params, not global state:

```
Step 1 → submit → POST /api/bookings returns booking_id
                   → redirect to Stripe Checkout (external)
                   → Stripe redirects to /book/confirmation?session_id=...
Step 3 → reads session_id from URL → fetches booking details
```

No state stored between tabs or steps — each step is a fresh page load. This prevents stale state bugs and works correctly on browser back/forward.