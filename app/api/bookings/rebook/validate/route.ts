import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { validateRebookToken } from '@/lib/tokens';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token parameter' }, { status: 400 });
    }

    const validation = await validateRebookToken(token);

    if (!validation.valid) {
      if (validation.reason === 'already_used') {
        return NextResponse.json({ error: 'This rebooking link has already been used.' }, { status: 400 });
      }
      if (validation.reason === 'expired') {
        return NextResponse.json({ error: 'This rebooking link has expired (30 days limit). Please contact support.' }, { status: 410 });
      }
      return NextResponse.json({ error: 'Invalid or expired rebooking link.' }, { status: 400 });
    }

    const booking = validation.booking!;
    const courseId = booking.session.course_id;

    // Fetch active non-archived non-finalised sessions for the same course
    const sessionsRaw = await prisma.session.findMany({
      where: {
        course_id: courseId,
        is_active: true,
        is_archived: false,
        is_finalised: false,
        date: { gte: new Date() }
      },
      include: {
        _count: {
          select: { bookings: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    const availableSessions = sessionsRaw.map((s) => ({
      id: s.id,
      date: s.date.toISOString(),
      start_time: s.start_time.toISOString(),
      end_time: s.end_time.toISOString(),
      venue_name: s.venue_name,
      venue_address: s.venue_address,
      maxCapacity: s.max_capacity,
      bookedCount: s._count.bookings,
    }));

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        user: {
          email: booking.user.email,
          first_name: booking.user.first_name,
        },
        session: {
          id: booking.session.id,
          course: {
            title: booking.session.course.title,
          }
        }
      },
      availableSessions,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Validate Rebook Token Error:', error);
    return NextResponse.json({ error: 'Failed to validate rebook token' }, { status: 500 });
  }
}

