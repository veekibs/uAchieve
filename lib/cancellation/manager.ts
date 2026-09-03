import prisma from '@/lib/prisma/client';
import Stripe from 'stripe';
import { generateBookingToken } from '@/lib/tokens';
import {
  sendStudentCancellationRefundEmail,
  sendStudentCancellationRebookEmail,
  sendAdminCancellationChoiceEmail,
  sendNoShowEmail,
  sendNoShowExhaustedEmail,
  sendRebookInviteEmail,
  sendAdminCancellation14DaysNoticeEmail
} from '@/lib/email/sender';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Branch 1 & Branch 2: Student Cancels Booking
 */
export async function processStudentCancellation(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, session: { include: { course: true } } }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  const now = new Date();
  const sessionDate = new Date(booking.session.date);
  const diffInDays = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays >= 14) {
    // Branch 1: Student cancels 14+ days before session -> Full Stripe Refund
    if (booking.stripe_payment_intent_id) {
      await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id
      });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled_by_student',
        cancellation_reason: 'Student cancelled 14+ days before session date',
        cancelled_at: new Date(),
        refund_status: 'full_refund_processed',
        refund_amount: booking.price_paid,
        refunded_at: new Date(),
        rebook_eligible: false,
      },
      include: { user: true, session: { include: { course: true } } }
    });

    try {
      await sendStudentCancellationRefundEmail(updated);
    } catch (e) {
      console.error('Failed to send student cancellation refund email:', e);
    }

    return { branch: 1, message: 'Full refund processed', booking: updated };
  } else {
    // Branch 2: Student cancels < 14 days before session -> No refund, mark rebook-eligible
    const { token, expiresAt } = generateBookingToken(30);

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled_by_student',
        cancellation_reason: 'Student cancelled < 14 days before session date',
        cancelled_at: new Date(),
        refund_status: 'none',
        rebook_eligible: true,
        rebook_used: false,
        rebook_token: token,
        rebook_token_expires_at: expiresAt,
        rebook_token_used_at: null,
      },
      include: { user: true, session: { include: { course: true } } }
    });

    try {
      await sendStudentCancellationRebookEmail(updated);
      await sendRebookInviteEmail(updated);
    } catch (e) {
      console.error('Failed to send student cancellation rebook email:', e);
    }

    return { branch: 2, message: 'Marked rebook eligible (non-refundable)', booking: updated };
  }
}

/**
 * Branch 3: No-Show Attendance Flow (Single use rebook tracking)
 */
export async function processNoShowAttendance(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, session: { include: { course: true } } }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  // Single-use check: if rebook_used was already true from a past rebooking, don't grant another
  if (booking.rebook_used) {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        attendance_status: 'no_show',
        is_completed: false,
        rebook_eligible: false,
      },
      include: { user: true, session: { include: { course: true } } }
    });

    try {
      await sendNoShowExhaustedEmail(updated);
    } catch (e) {
      console.error('Failed to send no-show exhausted email:', e);
    }

    return { branch: 3, action: 'rebook_exhausted', message: 'Rebook allowance already used', booking: updated };
  }

  // First time no-show: grant 1 free rebook
  const { token, expiresAt } = generateBookingToken(30);

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      attendance_status: 'no_show',
      is_completed: false,
      rebook_eligible: true,
      rebook_used: false,
      rebook_token: token,
      rebook_token_expires_at: expiresAt,
      rebook_token_used_at: null,
    },
    include: { user: true, session: { include: { course: true } } }
  });

  try {
    await sendNoShowEmail(updated);
    await sendRebookInviteEmail(updated);
  } catch (e) {
    console.error('Failed to send no-show email:', e);
  }

  return { branch: 3, action: 'rebook_granted', message: 'First no-show: granted 1 free rebook', booking: updated };
}

/**
 * Branch 4 & Branch 5: Admin Session Cancellation
 */
export async function processAdminSessionCancellation(sessionId: string) {
  const sessionRecord = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      course: true,
      bookings: {
        where: { status: { notIn: ['cancelled_by_student', 'cancelled_by_admin'] } },
        include: { user: true }
      }
    }
  });

  if (!sessionRecord) {
    throw new Error('Session not found');
  }

  const now = new Date();
  const sessionDate = new Date(sessionRecord.date);
  const diffInDays = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  // Mark session archived and inactive
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      is_archived: true,
      is_active: false,
    }
  });

  if (diffInDays < 14) {
    // Branch 4: Admin cancels < 14 days before session date -> Student choice (Rebook OR Full Refund)
    const updatedBookings = [];
    for (const booking of sessionRecord.bookings) {
      const { token, expiresAt } = generateBookingToken(30);

      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'cancelled_by_admin',
          cancellation_reason: 'Admin cancelled session < 14 days before date',
          cancelled_at: new Date(),
          refund_status: 'pending_student_choice',
          rebook_eligible: false,
          choice_token: token,
          choice_token_expires_at: expiresAt,
          choice_token_used_at: null,
        },
        include: { user: true, session: { include: { course: true } } }
      });

      try {
        await sendAdminCancellationChoiceEmail(updated);
      } catch (e) {
        console.error(`Failed to send choice email to ${booking.user.email}:`, e);
      }
      updatedBookings.push(updated);
    }

    return {
      branch: 4,
      diffInDays,
      studentChoiceRequired: true,
      message: 'Session cancelled < 14 days prior. Choice emails dispatched to students.',
      bookingsCount: updatedBookings.length
    };
  } else {
    // Branch 5: Admin cancels 14+ days before session date -> Send EMAIL-003 notice email & flag manual contact in UI
    const updatedBookings = [];
    for (const booking of sessionRecord.bookings) {
      const updated = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'cancelled_by_admin',
          cancellation_reason: 'Admin cancelled session 14+ days before date - contact students directly',
          cancelled_at: new Date(),
          refund_status: 'none',
          rebook_eligible: false,
        },
        include: { user: true, session: { include: { course: true } } }
      });

      try {
        await sendAdminCancellation14DaysNoticeEmail(updated);
      } catch (e) {
        console.error(`Failed to send 14-days notice email to ${booking.user.email}:`, e);
      }

      updatedBookings.push(updated);
    }

    return {
      branch: 5,
      diffInDays,
      manualAdminContactRequired: true,
      message: 'Session cancelled 14+ days prior. Reschedule notice sent to students and flagged for admin follow-up.',
      bookingsCount: updatedBookings.length
    };
  }
}

