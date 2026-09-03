import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as cancellationManager from '@/lib/cancellation/manager';
import prisma from '@/lib/prisma/client';

const { mockRefundsCreate } = vi.hoisted(() => ({
  mockRefundsCreate: vi.fn(),
}));

vi.mock('stripe', () => {
  return {
    default: class {
      refunds = {
        create: mockRefundsCreate,
      };
    },
  };
});

// Mock Email Sender
vi.mock('@/lib/email/sender', () => ({
  sendStudentCancellationRefundEmail: vi.fn().mockResolvedValue({}),
  sendStudentCancellationRebookEmail: vi.fn().mockResolvedValue({}),
  sendAdminCancellationChoiceEmail: vi.fn().mockResolvedValue({}),
  sendNoShowEmail: vi.fn().mockResolvedValue({}),
  sendNoShowExhaustedEmail: vi.fn().mockResolvedValue({}),
  sendRebookInviteEmail: vi.fn().mockResolvedValue({}),
  sendAdminCancellation14DaysNoticeEmail: vi.fn().mockResolvedValue({}),
}));

// Mock Prisma
vi.mock('@/lib/prisma/client', () => {
  const mockBooking = {
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  return {
    default: {
      booking: mockBooking,
    },
    prisma: {
      booking: mockBooking,
    },
  };
});

describe('TEST-004 · Refund and Rebooking Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefundsCreate.mockResolvedValue({ id: 're_test_123', status: 'succeeded' });
  });

  it('1. Student cancels 14+ days before session: triggers full Stripe refund & updates DB', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20); // 20 days ahead

    const mockBookingData = {
      id: 'booking-refund-14',
      stripe_payment_intent_id: 'pi_test_12345',
      price_paid: 145.0,
      user: { email: 'student14@example.com', first_name: 'Alice' },
      session: {
        date: futureDate.toISOString(),
        course: { title: 'Basic Life Support (BLS)' },
      },
    };

    (prisma.booking.findUnique as any).mockResolvedValue(mockBookingData);
    (prisma.booking.update as any).mockResolvedValue({
      ...mockBookingData,
      status: 'cancelled_by_student',
      refund_status: 'full_refund_processed',
    });

    const result = await cancellationManager.processStudentCancellation('booking-refund-14');

    expect(result.branch).toBe(1);
    expect(mockRefundsCreate).toHaveBeenCalledTimes(1);
    expect(mockRefundsCreate).toHaveBeenCalledWith({
      payment_intent: 'pi_test_12345',
    });
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-refund-14' },
        data: expect.objectContaining({
          status: 'cancelled_by_student',
          refund_status: 'full_refund_processed',
          rebook_eligible: false,
        }),
      })
    );
  });

  it('2. Student cancels less than 14 days before session: issues no Stripe refund and generates rebook token', async () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 5); // 5 days ahead (< 14 days)

    const mockBookingData = {
      id: 'booking-rebook-5',
      stripe_payment_intent_id: 'pi_test_67890',
      price_paid: 145.0,
      user: { email: 'student5@example.com', first_name: 'Bob' },
      session: {
        date: soonDate.toISOString(),
        course: { title: 'Emergency First Aid at Work' },
      },
    };

    (prisma.booking.findUnique as any).mockResolvedValue(mockBookingData);
    (prisma.booking.update as any).mockResolvedValue({
      ...mockBookingData,
      status: 'cancelled_by_student',
      refund_status: 'none',
      rebook_eligible: true,
    });

    const result = await cancellationManager.processStudentCancellation('booking-rebook-5');

    expect(result.branch).toBe(2);
    expect(mockRefundsCreate).not.toHaveBeenCalled(); // No refund
    expect(prisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-rebook-5' },
        data: expect.objectContaining({
          status: 'cancelled_by_student',
          refund_status: 'none',
          rebook_eligible: true,
          rebook_used: false,
        }),
      })
    );
  });
});

