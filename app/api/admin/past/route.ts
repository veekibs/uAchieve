import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        is_archived: false,
        OR: [
          { date: { lt: new Date() } },
          { is_finalised: true }
        ]
      },
      include: {
        course: true,
        bookings: {
          include: { user: true }
        }
      },
      orderBy: { 
        date: 'desc' 
      }
    });
    // Ensure we only return sessions that have a valid linked course
    return NextResponse.json(sessions.filter(s => s.course !== null));
  } catch (error) {
    console.error("Admin Past Sessions Fetch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
