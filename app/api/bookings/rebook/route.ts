import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { validateRebookToken } from '@/lib/tokens';
import { sendRebookConfirmationEmail } from '@/lib/email/sender';

class RebookCapacityExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RebookCapacityExceededError';
  }
}

export async function POST(req: Request) {
  try {
    const { token, targetSessionId } = await req.json();

    if (!token || !targetSessionId) {
      return NextResponse.json({ error: 'Missing token or target session' }, { status: 400 });
    }

    const validation = await validateRebookToken(token);
    if (!validation.valid) {
      if (validation.reason === 'already_used') {
        return NextResponse.json({ error: 'This rebook link has already been used.' }, { status: 400 });
      }
      if (validation.reason === 'expired') {
        return NextResponse.json({ error: 'This rebook link has expired (30 days limit). Please contact support.' }, { status: 410 });
      }
      return NextResponse.json({ error: 'Invalid or expired rebook link.' }, { status: 400 });
    }

    const originalBooking = validation.booking!;

    let newBooking: any;
    try {
      newBooking = await prisma.$transaction(async (tx) => {
        // 1. Lock target session row to serialize concurrent booking transfers
        await tx.$queryRaw`SELECT id FROM sessions WHERE id = ${targetSessionId}::uuid FOR UPDATE`;

        // 2. Fetch target session details and verify status
        const targetSession = await tx.session.findUnique({
          where: { id: targetSessionId },
          include: { course: true }
        });

        if (!targetSession || !targetSession.is_active || targetSession.is_archived || targetSession.is_finalised) {
          throw new Error('This session is no longer available for booking.');
        }

        // Check course matches original course
        if (targetSession.course_id !== originalBooking.session.course_id) {
          throw new Error('Rebooking is only permitted for the same course type.');
        }

        // 3. Count confirmed bookings under lock
        const currentCount = await tx.booking.count({
          where: {
            session_id: targetSessionId,
            status: { notIn: ['cancelled_by_student', 'cancelled_by_admin'] }
          }
        });

        if (currentCount >= targetSession.max_capacity) {
          throw new RebookCapacityExceededError('Target session has reached maximum capacity.');
        }

        // 4. Create NEW Booking row linked to original via rebooked_to_booking_id
        const newRef = `uA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const created = await tx.booking.create({
          data: {
            user_id: originalBooking.user_id,
            session_id: targetSessionId,
            booking_reference: newRef,
            payment_status: 'paid',
            attendance_status: 'not_attended',
            price_paid: 0.00,
            rebook_eligible: false,
            rebook_used: true,
            booked_at: new Date(),
          },
          include: {
            user: true,
            session: {
              include: {
                course: true
              }
            }
          }
        });

        // 5. Update original booking record (mark rebook_used: true and store link)
        await tx.booking.update({
          where: { id: originalBooking.id },
          data: {
            rebook_eligible: false,
            rebook_used: true,
            rebooked_to_booking_id: created.id,
            rebook_token_used_at: new Date(),
          }
        });

        return created;
      });
    } catch (txErr: any) {
      if (txErr instanceof RebookCapacityExceededError || txErr?.name === 'RebookCapacityExceededError') {
        return NextResponse.json({
          error: 'That session just reached full capacity. Please select another available date.'
        }, { status: 409 });
      }
      throw txErr;
    }

    // Dispatch confirmation email for new session
    try {
      await sendRebookConfirmationEmail(newBooking);
    } catch (emailErr) {
      console.error('Failed to send rebook confirmation email:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Rebooking completed successfully.',
      booking: newBooking
    }, { status: 200 });

  } catch (error: any) {
    console.error('Rebooking Transfer Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to complete rebooking' }, { status: 500 });
  }
}

