import { prisma } from '@/lib/prisma/client';

export async function getOrCreateTestCourse(slug = 'bls', title = 'Basic Life Support (BLS)') {
  let course = await prisma.course.findFirst({
    where: {
      OR: [
        { slug: slug },
        { slug: 'bls' },
        { slug: 'basic-life-support' },
        { title: { contains: 'Basic Life Support', mode: 'insensitive' } },
      ],
    },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title,
        slug,
        description: 'Comprehensive Basic Life Support (BLS) training course.',
        duration_hours: 4,
        price: 75.0,
      },
    });
  }

  return course;
}

export async function getNextAvailableSaturday(): Promise<string> {
  const date = new Date();
  date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7 || 7));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function createOrGetUpcomingTestSession(courseId: string, options: { maxCapacity?: number; date?: string; venueName?: string } = {}) {
  const sessionDate = options.date || (await getNextAvailableSaturday());
  const maxCapacity = options.maxCapacity || 12;
  const venueName = options.venueName || 'UAchieve Bedford Training Centre';
  const venueAddress = '123 High Street, Bedford, MK40 1AA';

  const session = await prisma.session.create({
    data: {
      course_id: courseId,
      date: new Date(`${sessionDate}T00:00:00Z`),
      start_time: new Date('1970-01-01T09:00:00Z'),
      end_time: new Date('1970-01-01T13:00:00Z'),
      venue_name: venueName,
      venue_address: venueAddress,
      max_capacity: maxCapacity,
      is_archived: false,
      is_finalised: false,
    },
  });

  return session;
}

export async function cleanupTestSession(sessionId: string) {
  try {
    await prisma.booking.deleteMany({
      where: { session_id: sessionId },
    });
    await prisma.session.delete({
      where: { id: sessionId },
    });
  } catch (err) {
    // Suppress if already deleted
  }
}

export async function cleanupTestUsersByEmailPrefix(prefix: string) {
  try {
    const testUsers = await prisma.user.findMany({
      where: {
        email: { startsWith: prefix },
      },
    });

    for (const user of testUsers) {
      await prisma.booking.deleteMany({
        where: { user_id: user.id },
      });
      await prisma.user.delete({
        where: { id: user.id },
      });
    }
  } catch (err) {
    // Suppress
  }
}

