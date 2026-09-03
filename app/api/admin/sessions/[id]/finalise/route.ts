import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { sendCompletionEmail } from '@/lib/email/sender';
import { processNoShowAttendance } from '@/lib/cancellation/manager';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.id;

    // Fetch the session with its bookings and related student accounts
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        bookings: {
          include: {
            user: true,
            session: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.is_finalised) {
      return NextResponse.json({ error: 'Session has already been finalised' }, { status: 400 });
    }

    // 1. Check for unmarked bookings (where attendance_status is 'not_attended' or empty)
    const unmarkedBookings = session.bookings.filter(
      (b) => !b.attendance_status || b.attendance_status === 'not_attended'
    );

    if (unmarkedBookings.length > 0) {
      const studentNames = unmarkedBookings
        .map((b) => `${b.user.first_name || 'Unknown'} ${b.user.last_name || ''}`)
        .join(', ');
      return NextResponse.json(
        {
          error: `Cannot finalise session. Roster has unmarked students: ${studentNames}. All students must be marked as Attended or No Show first.`
        },
        { status: 400 }
      );
    }

    // 2. Mark the session itself as finalised
    await prisma.session.update({
      where: { id: sessionId },
      data: { is_finalised: true }
    });

    // 3. Loop over bookings and trigger completion or no-show emails
    // We send them asynchronously and safely catch errors so one failure doesn't block the rest
    const emailPromises = session.bookings.map(async (booking) => {
      try {
        if (booking.is_completed || booking.attendance_status === 'attended' || booking.attendance_status === 'completed') {
          await sendCompletionEmail(booking);
          console.log(`Finalise: Completion email sent to ${booking.user.email}`);
        } else if (booking.attendance_status === 'noshow' || booking.attendance_status === 'no_show') {
          const res = await processNoShowAttendance(booking.id);
          console.log(`Finalise: No-show processing complete for ${booking.user.email} (Action: ${res.action})`);
        }
      } catch (err) {
        console.error(`Finalise: Failed to process booking for ${booking.user.email}:`, err);
      }
    });

    // Await all email dispatches in parallel
    await Promise.all(emailPromises);

    return NextResponse.json({
      success: true,
      message: 'Session successfully finalised. Emails sent.'
    });
  } catch (error: any) {
    console.error('Session Finalisation Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}

