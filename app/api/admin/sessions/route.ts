import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        course: true,
        bookings: {
          include: { user: true },
        }
      },
      orderBy: { 
        date: 'asc' 
      }
    });

    // Calculate dynamic stats
    const totalStudentsTrained = await prisma.booking.count({
      where: { attendance_status: 'attended' }
    });

    // Calculate Total Revenue from all paid bookings
    const paidBookings = await prisma.booking.findMany({
      where: { payment_status: 'paid' },
      include: {
        session: {
          include: { course: true }
        }
      }
    });

    const totalRevenue = paidBookings.reduce((acc, booking) => {
      return acc + (Number(booking.session?.course?.price) || 0);
    }, 0);

    return NextResponse.json({ 
      sessions: sessions.filter(s => s.course !== null), // Filter out "fake" sessions
      stats: {
        totalStudentsTrained,
        certificatesIssued: totalStudentsTrained,
        totalRevenue
      }
    });
  } catch (error) {
    console.error("Admin Sessions Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { course_id, date, max_capacity, start_time, end_time, venue_name, venue_address } = body;
    if (!course_id || !date || !start_time || !end_time || !venue_name || !venue_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse input date locally and validate
    const [year, month, day] = date.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    if (localDate.getDay() !== 6) {
      return NextResponse.json({ error: 'Sessions must be scheduled on Saturdays' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (localDate < today) {
      return NextResponse.json({ error: 'Cannot create a session in the past' }, { status: 400 });
    }

    // Store wall-clock time directly without local timezone conversion
    const sessionDate = new Date(date);
    const sessionStartTime = new Date(`1970-01-01T${start_time}:00Z`);
    const sessionEndTime = new Date(`1970-01-01T${end_time}:00Z`);

    const newSession = await prisma.session.create({
      data: {
        course_id,
        date: sessionDate,
        start_time: sessionStartTime,
        end_time: sessionEndTime,
        venue_name,
        venue_address,
        max_capacity: parseInt(max_capacity) || 12,
        is_active: true,
      }
    });

    return NextResponse.json({ message: 'Session created successfully', session: newSession }, { status: 201 });
  } catch (error) {
    console.error("Session Creation Error:", error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}