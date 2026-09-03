import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';
import { sendSessionReminderEmail } from '@/lib/email/sender';

export async function GET(req: Request) {
  try {
    // 1. Validate Cron Authorization Header if secret is set
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();

    // 2. Precision Date Windows (Exact 00:00:00 to 23:59:59 bounds)
    // 7 days out target window
    const target7DaysStart = new Date(today);
    target7DaysStart.setDate(target7DaysStart.getDate() + 7);
    target7DaysStart.setHours(0, 0, 0, 0);

    const target7DaysEnd = new Date(today);
    target7DaysEnd.setDate(target7DaysEnd.getDate() + 7);
    target7DaysEnd.setHours(23, 59, 59, 999);

    // 1 day out (tomorrow) target window
    const target1DayStart = new Date(today);
    target1DayStart.setDate(target1DayStart.getDate() + 1);
    target1DayStart.setHours(0, 0, 0, 0);

    const target1DayEnd = new Date(today);
    target1DayEnd.setDate(target1DayEnd.getDate() + 1);
    target1DayEnd.setHours(23, 59, 59, 999);

    // 3. Query 7-day bookings with week_reminder_sent_at IS NULL
    const weekReminderBookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        payment_status: 'paid',
        week_reminder_sent_at: null,
        session: {
          is_active: true,
          is_archived: false,
          date: {
            gte: target7DaysStart,
            lte: target7DaysEnd,
          }
        }
      },
      include: {
        user: true,
        session: {
          include: { course: true }
        }
      }
    });

    // 4. Query 1-day bookings with day_reminder_sent_at IS NULL
    const dayReminderBookings = await prisma.booking.findMany({
      where: {
        status: 'confirmed',
        payment_status: 'paid',
        day_reminder_sent_at: null,
        session: {
          is_active: true,
          is_archived: false,
          date: {
            gte: target1DayStart,
            lte: target1DayEnd,
          }
        }
      },
      include: {
        user: true,
        session: {
          include: { course: true }
        }
      }
    });

    // 5. Send 7-day reminders & update week_reminder_sent_at
    let weekSentCount = 0;
    for (const booking of weekReminderBookings) {
      try {
        await sendSessionReminderEmail(booking, '1_week');
        await prisma.booking.update({
          where: { id: booking.id },
          data: { week_reminder_sent_at: new Date() }
        });
        weekSentCount++;
      } catch (err) {
        console.error(`Failed to send 1-week reminder for booking ${booking.id}:`, err);
      }
    }

    // 6. Send 24-hour reminders & update day_reminder_sent_at
    let daySentCount = 0;
    for (const booking of dayReminderBookings) {
      try {
        await sendSessionReminderEmail(booking, '24_hour');
        await prisma.booking.update({
          where: { id: booking.id },
          data: { day_reminder_sent_at: new Date() }
        });
        daySentCount++;
      } catch (err) {
        console.error(`Failed to send 24-hour reminder for booking ${booking.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      remindersSent: {
        weekReminders: weekSentCount,
        dayReminders: daySentCount,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Session Reminder Cron Error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to process reminders' }, { status: 500 });
  }
}

