import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { sendCertificateReadyEmail } from '@/lib/email/sender';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        course: true,
        bookings: {
          include: {
            user: true,
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.is_finalised) {
      return NextResponse.json({ error: 'Cannot notify students for an unfinalised session' }, { status: 400 });
    }

    if (session.certificate_notified_at) {
      return NextResponse.json({ error: 'Students have already been notified' }, { status: 400 });
    }

    const completedBookings = session.bookings.filter(b => b.is_completed);

    // Send emails
    for (const booking of completedBookings) {
      try {
        await sendCertificateReadyEmail({ ...booking, session });
      } catch (err) {
        console.error(`Failed to send certificate email to ${booking.user.email}:`, err);
        // Continue with other emails even if one fails
      }
    }

    const updatedSession = await prisma.session.update({
      where: { id },
      data: { certificate_notified_at: new Date() }
    });

    return NextResponse.json({ 
      success: true, 
      notifiedCount: completedBookings.length,
      session: updatedSession 
    });
  } catch (error) {
    console.error('Error notifying students:', error);
    return NextResponse.json({ error: 'Failed to notify students' }, { status: 500 });
  }
}
