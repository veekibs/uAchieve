import { NextResponse } from 'next/server';
import { processAdminSessionCancellation } from '@/lib/cancellation/manager';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await processAdminSessionCancellation(id);

    return NextResponse.json({
      message: result.message,
      branch: result.branch,
      diffInDays: result.diffInDays,
      manualAdminContactRequired: (result as any).manualAdminContactRequired || false,
      studentChoiceRequired: (result as any).studentChoiceRequired || false,
      bookingsCount: result.bookingsCount
    }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Session Cancellation Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to cancel session' }, { status: 500 });
  }
}
