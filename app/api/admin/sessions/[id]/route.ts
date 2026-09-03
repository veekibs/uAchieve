import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { sendSessionUpdatedEmail } from '@/lib/email/sender';

export const dynamic = 'force-dynamic';

function formatYYYYMMDD(d: Date | string): string {
  const dt = new Date(d);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        course: true,
        bookings: {
          include: { user: true }
        }
      }
    });

    if (!session || !session.course) {
      return NextResponse.json({ error: 'Session or Course not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Admin Session Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await req.json();

    const {
      course_id,
      date,
      start_time,
      end_time,
      venue_name,
      venue_address,
      max_capacity,
      confirmManualNotification
    } = body;

    // 1. Fetch existing session with active bookings
    const existingSession = await prisma.session.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { notIn: ['cancelled_by_student', 'cancelled_by_admin'] }
          },
          include: {
            user: true
          }
        }
      }
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 2. Guard: Past or finalised sessions cannot be edited
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingDate = new Date(existingSession.date);

    if (existingSession.is_finalised || existingSession.is_archived || existingDate < today) {
      return NextResponse.json({ error: 'Past, finalised, or archived sessions cannot be edited.' }, { status: 400 });
    }

    const activeBookingsCount = existingSession.bookings.length;

    // 3. Guard: Capacity lowering check
    if (typeof max_capacity === 'number' && max_capacity < activeBookingsCount) {
      return NextResponse.json({
        error: `Cannot set max capacity to ${max_capacity} because this session already has ${activeBookingsCount} confirmed booking(s).`
      }, { status: 400 });
    }

    // 4. Detect Date or Venue changes using UTC YYYY-MM-DD formatting to prevent timezone shifts
    const existingDateStr = formatYYYYMMDD(existingSession.date);
    const incomingDateStr = date ? formatYYYYMMDD(date) : existingDateStr;

    const dateChanged = existingDateStr !== incomingDateStr;
    const venueNameChanged = venue_name ? (existingSession.venue_name || '').trim().toLowerCase() !== venue_name.trim().toLowerCase() : false;
    const venueAddressChanged = venue_address ? (existingSession.venue_address || '').trim().toLowerCase() !== venue_address.trim().toLowerCase() : false;

    const criticalFieldChanged = dateChanged || venueNameChanged || venueAddressChanged;

    // 5. Require explicit confirmation if active bookings exist and critical fields changed
    if (activeBookingsCount > 0 && criticalFieldChanged && !confirmManualNotification) {
      return NextResponse.json({
        requiresConfirmation: true,
        bookedCount: activeBookingsCount,
        message: `This session has ${activeBookingsCount} active booking(s). Changing the date or venue means these students will need to be notified manually. Are you sure you want to continue?`
      }, { status: 409 });
    }

    // 6. Format time strings into ISO Date strings for PostgreSQL @db.Time columns
    let startTimeISO = existingSession.start_time;
    let endTimeISO = existingSession.end_time;

    if (start_time) {
      startTimeISO = new Date(`1970-01-01T${start_time}:00Z`);
    }
    if (end_time) {
      endTimeISO = new Date(`1970-01-01T${end_time}:00Z`);
    }

    // 7. Perform in-place UPDATE (never delete or recreate)
    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        ...(course_id && { course_id }),
        ...(date && { date: new Date(date) }),
        ...(start_time && { start_time: startTimeISO }),
        ...(end_time && { end_time: endTimeISO }),
        ...(venue_name !== undefined && { venue_name }),
        ...(venue_address !== undefined && { venue_address }),
        ...(max_capacity !== undefined && { max_capacity: Number(max_capacity) }),
      },
      include: {
        course: true,
        bookings: {
          include: { user: true }
        }
      }
    });

    // 8. Automatically email notify all registered students of the changes
    const timeChanged = Boolean(start_time || end_time);
    const shouldNotify = criticalFieldChanged || timeChanged;

    if (shouldNotify && activeBookingsCount > 0) {
      const activeBookings = updatedSession.bookings.filter(
        b => !['cancelled_by_student', 'cancelled_by_admin'].includes(b.status)
      );

      for (const booking of activeBookings) {
        try {
          if (booking.user?.email) {
            await sendSessionUpdatedEmail({
              ...booking,
              session: updatedSession
            });
            console.log(`Edit Session: Update notification dispatched to ${booking.user.email}`);
          }
        } catch (emailErr) {
          console.error(`Failed to send session update email to ${booking.user?.email || 'student'}:`, emailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully and registered students notified.',
      session: updatedSession
    }, { status: 200 });

  } catch (error: any) {
    console.error('Admin Session Edit Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update session' }, { status: 500 });
  }
}
