import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/route';
import prisma from '@/lib/prisma/client';

const { mockCheckoutCreate } = vi.hoisted(() => ({
  mockCheckoutCreate: vi.fn(),
}));

vi.mock('stripe', () => {
  return {
    default: class {
      checkout = {
        sessions: {
          create: mockCheckoutCreate,
        },
      };
    },
  };
});

// Mock Prisma
vi.mock('@/lib/prisma/client', () => {
  const mockSession = {
    findUnique: vi.fn(),
  };
  const mockBooking = {
    findFirst: vi.fn(),
  };
  return {
    default: {
      session: mockSession,
      booking: mockBooking,
    },
    prisma: {
      session: mockSession,
      booking: mockBooking,
    },
  };
});

describe('TEST-008 · Capacity and Concurrency Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckoutCreate.mockResolvedValue({
      id: 'cs_test_session_123',
      url: 'https://checkout.stripe.com/pay/cs_test_session_123',
    });
  });

  const baseValidPayload = {
    firstName: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    phone: '07123456789',
    sessionId: 'session-concurrency-1',
    courseName: 'Basic Life Support (BLS)',
    price: 75.0,
    date: '2026-10-24',
    time: '09:00 - 13:00',
    venue: 'Bedford Venue',
    slug: 'basic-life-support',
    smsConsent: true,
  };

  it('1. Rejects booking with 409 when session is fully booked (e.g. 12/12 capacity)', async () => {
    (prisma.session.findUnique as any).mockResolvedValue({
      id: 'session-concurrency-1',
      is_active: true,
      is_archived: false,
      is_finalised: false,
      max_capacity: 12,
      _count: { bookings: 12 }, // full
    });

    const req = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(baseValidPayload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain('fully booked');
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('2. Rejects booking with 400 when session is finalised or inactive', async () => {
    (prisma.session.findUnique as any).mockResolvedValue({
      id: 'session-concurrency-1',
      is_active: true,
      is_archived: false,
      is_finalised: true, // finalised
      max_capacity: 12,
      _count: { bookings: 5 },
    });

    const req = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(baseValidPayload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('no longer available');
  });

  it('3. Rejects duplicate booking with 409 when user already has an active booking for this session', async () => {
    (prisma.session.findUnique as any).mockResolvedValue({
      id: 'session-concurrency-1',
      is_active: true,
      is_archived: false,
      is_finalised: false,
      max_capacity: 12,
      _count: { bookings: 2 },
    });

    (prisma.booking.findFirst as any).mockResolvedValue({
      id: 'existing-booking-1',
      status: 'paid',
      user: { email: 'john.doe@example.com' },
    });

    const req = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify(baseValidPayload),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain('already have an active booking');
    expect(mockCheckoutCreate).not.toHaveBeenCalled();
  });

  it('4. Simulates two simultaneous checkouts for last remaining spot: exactly one succeeds, other fails', async () => {
    let bookingCount = 0;
    const maxCap = 1;

    (prisma.booking.findFirst as any).mockResolvedValue(null);

    // Dynamic mock simulating atomic state check
    (prisma.session.findUnique as any).mockImplementation(async () => {
      const current = bookingCount;
      bookingCount += 1;
      return {
        id: 'session-concurrency-1',
        is_active: true,
        is_archived: false,
        is_finalised: false,
        max_capacity: maxCap,
        _count: { bookings: current },
      };
    });

    const req1 = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ ...baseValidPayload, email: 'user1@example.com' }),
    });

    const req2 = new Request('http://localhost:3000/api/checkout', {
      method: 'POST',
      body: JSON.stringify({ ...baseValidPayload, email: 'user2@example.com' }),
    });

    const [res1, res2] = await Promise.all([POST(req1), POST(req2)]);

    const statuses = [res1.status, res2.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409);
  });
});

