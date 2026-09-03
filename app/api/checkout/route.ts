import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma/client';

// Ensure this is using the key from your .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("CHECKOUT_RECEIVED_BODY:", body);
    const { firstName, surname, email, phone, companyName, courseType, sessionId, courseName, price, date, time, venue, slug, smsConsent } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return NextResponse.json({ error: "Payment gateway is not properly configured. Please try again shortly." }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Capacity & Session Check
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        course: true,
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!sessionRecord) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!sessionRecord.is_active || sessionRecord.is_archived || sessionRecord.is_finalised) {
      return NextResponse.json({ error: "Sorry, this session is no longer available for booking." }, { status: 400 });
    }

    if (sessionRecord._count.bookings >= sessionRecord.max_capacity) {
      return NextResponse.json({ error: "Sorry, this session is now fully booked." }, { status: 409 });
    }

    // Duplicate Booking Check (Email + Session ID for active non-cancelled bookings)
    if (email) {
      const existingBooking = await prisma.booking.findFirst({
        where: {
          session_id: sessionId,
          status: { notIn: ['cancelled_by_student', 'cancelled_by_admin'] },
          user: {
            email: email.toLowerCase().trim()
          }
        }
      });

      if (existingBooking) {
        return NextResponse.json({ error: "You already have an active booking for this session. Please check your confirmation email or choose another date." }, { status: 409 });
      }
    }

    const resolvedCourseName = courseName || sessionRecord.course?.title || 'Training Course';
    const rawPrice = Number(price || sessionRecord.course?.price || 85);
    const resolvedPrice = isNaN(rawPrice) || rawPrice <= 0 ? 85 : rawPrice;
    const unitAmount = Math.round(resolvedPrice * 100);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://u-achieve.co.uk';

    const session = await stripe.checkout.sessions.create({
      customer_email: (email || '').toLowerCase().trim(),
      payment_method_types: ['card', 'klarna'],
      payment_intent_data: {
        metadata: {
          sessionId: String(sessionId || ''),
          courseType: String(courseType || 'first-time'),
        },
      },
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: resolvedCourseName },
          unit_amount: unitAmount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/book/step1?sessionId=${sessionId}&slug=${slug || ''}`,
      metadata: {
        sessionId: String(sessionId || ''),
        userEmail: String(email || '').toLowerCase().trim(),
        courseName: String(resolvedCourseName),
        courseType: String(courseType || 'first-time'),
        firstName: String(firstName || ''),
        surname: String(surname || ''),
        phone: String(phone || ''),
        companyName: String(companyName || ''),
        smsConsent: String(smsConsent === true || smsConsent === 'true'),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('CHECKOUT_ERROR:', error);
    return NextResponse.json({ error: error?.message || 'Something went wrong while setting up payment.' }, { status: 500 });
  }
}