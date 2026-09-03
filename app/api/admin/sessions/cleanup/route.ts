import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Find all sessions
    const sessions = await prisma.session.findMany({
      include: { course: true }
    });

    // Filter for sessions where the course relationship is null (orphaned)
    const orphanedSessionIds = sessions
      .filter(session => session.course === null)
      .map(session => session.id);

    if (orphanedSessionIds.length === 0) {
      return NextResponse.json({ message: "No orphaned sessions found." });
    }

    const deleted = await prisma.session.deleteMany({
      where: { id: { in: orphanedSessionIds } }
    });

    return NextResponse.json({ message: `Deleted ${deleted.count} orphaned sessions.` });
  } catch (error) {
    console.error("Cleanup Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

