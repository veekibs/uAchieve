import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma/client';

// Ensure this is using the key from your .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("CHECKOUT_RECEIVED_BODY:", body);
    const { firstName, surname, email, phone, companyName, sessionId, courseName, price, date, time, venue, slug, smsConsent } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Capacity Check
    const sessionRecord = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
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

    console.log("SENDING_TO_STRIPE_METADATA:", { sessionId });

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card', 'klarna'],
      payment_intent_data: {
        metadata: {
          sessionId: sessionId, // This attaches the ID directly to the Payment Intent
        },
      },
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: courseName },
          unit_amount: Math.round(Number(price) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://uachieve.co.uk'}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://uachieve.co.uk'}/book/step1?sessionId=${sessionId}&slug=${slug || ''}`,
      // Extended to ensure all form fields reach the webhook
      metadata: {
        sessionId: sessionId, 
        userEmail: email,
        courseName: courseName,
        firstName: firstName,
        surname: surname,
        phone: phone,
        companyName: companyName,
        smsConsent: String(smsConsent === true || smsConsent === 'true'),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('CHECKOUT_ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}