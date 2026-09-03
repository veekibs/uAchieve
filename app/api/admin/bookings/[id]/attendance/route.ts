import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { sendCompletionEmail } from '@/lib/email/sender';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const body = await req.json();
    
    // Extract both status fields to allow independent updates
    const { attendance_status, is_completed } = body;

    const updateData: any = {};
    if (attendance_status !== undefined) {
      updateData.attendance_status = attendance_status;
    }
    if (is_completed !== undefined) {
      updateData.is_completed = is_completed;
    }

    // Check if we actually have fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    // Fetch current booking state to verify transition idempotency
    const currentBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isTransitioningToCompleted = 
      is_completed === true && 
      !currentBooking.is_completed;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: { 
        user: true, 
        session: { include: { course: true } } 
      }
    });

    // Send email only if status transitioned to completed
    if (isTransitioningToCompleted) {
      try {
        await sendCompletionEmail(updatedBooking);
        console.log(`Completion email sent via Resend to ${updatedBooking.user.email} for course ${updatedBooking.session.course.title}`);
      } catch (emailErr) {
        console.error("Resend completion email failed:", emailErr);
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error("Admin Attendance/Completion Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
