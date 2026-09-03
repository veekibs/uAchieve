import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // 1. Query database for confirmed booking by stripe checkout session ID
    const booking = await prisma.booking.findUnique({
      where: { stripe_checkout_session_id: sessionId },
      include: {
        user: true,
        session: {
          include: { course: true }
        }
      }
    });

    if (booking) {
      if (booking.refund_status === 'full_refund_processed') {
        return NextResponse.json({
          status: 'capacity_refunded',
          message: 'This session reached maximum capacity as payment was processed. A full refund has been issued to your payment method.'
        }, { status: 200 });
      }

      return NextResponse.json({
        status: 'confirmed',
        booking: {
          id: booking.id,
          booking_reference: booking.booking_reference,
          userEmail: booking.user.email,
          studentName: `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim(),
          courseTitle: booking.session.course.title,
          date: booking.session.date,
          start_time: booking.session.start_time,
          end_time: booking.session.end_time,
          venue_name: booking.session.venue_name,
          venue_address: booking.session.venue_address,
          price_paid: booking.price_paid,
        }
      }, { status: 200 });
    }

    // 2. Booking not in DB yet - check direct status from Stripe API
    let stripeSession: Stripe.Checkout.Session | null = null;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeErr) {
      console.error("Failed to retrieve Stripe session:", stripeErr);
    }

    if (stripeSession) {
      if (stripeSession.payment_status === 'unpaid') {
        return NextResponse.json({ status: 'payment_failed' }, { status: 200 });
      }

      // If Stripe payment intent was refunded
      if (stripeSession.payment_intent) {
        try {
          const pi = await stripe.paymentIntents.retrieve(stripeSession.payment_intent as string);
          if (pi.status === 'canceled' || pi.amount_received === 0) {
            return NextResponse.json({
              status: 'capacity_refunded',
              message: 'This session reached maximum capacity. A full refund has been issued to your payment method.'
            }, { status: 200 });
          }
        } catch (e) {}
      }
    }

    return NextResponse.json({
      status: 'pending',
      message: 'Booking processing in progress...'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Verify Checkout Session Error:', error);
    return NextResponse.json({ error: 'Failed to verify booking status' }, { status: 500 });
  }
}

