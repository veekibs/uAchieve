import { NextResponse } from 'next/server';
import { processStudentCancellation } from '@/lib/cancellation/manager';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await processStudentCancellation(id);

    return NextResponse.json({
      success: true,
      branch: result.branch,
      message: result.message,
      booking: result.booking,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Student Booking Cancellation Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to cancel booking' }, { status: 500 });
  }
}

