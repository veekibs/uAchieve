import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma/client';
import { validateBookingToken, generateBookingToken } from '@/lib/tokens';
import { sendRebookInviteEmail } from '@/lib/email/sender';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const action = searchParams.get('action');

    if (!token || !action || !['refund', 'rebook'].includes(action)) {
      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h2 style="color: #ef4444;">Invalid Link Request</h2>
            <p>The choice link is invalid or missing security parameters.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' }, status: 400 });
    }

    const validation = await validateBookingToken(token);

    if (!validation.valid) {
      if (validation.reason === 'already_used') {
        return new NextResponse(`
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #29ABE2;">Choice Already Confirmed</h2>
              <p>This single-use link has already been submitted and your preference has been recorded.</p>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' }, status: 200 });
      }

      if (validation.reason === 'expired') {
        return new NextResponse(`
          <html>
            <body style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ef4444;">Link Expired</h2>
              <p>This choice link has expired (30-day limit). Please contact support at info@uachieve.co.uk for assistance.</p>
            </body>
          </html>
        `, { headers: { 'Content-Type': 'text/html' }, status: 410 });
      }

      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Invalid or Expired Link</h2>
            <p>We could not verify this choice link. Please contact support at info@uachieve.co.uk.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' }, status: 404 });
    }

    const booking = validation.booking!;

    if (action === 'refund') {
      if (booking.stripe_payment_intent_id) {
        if (process.env.STRIPE_SECRET_KEY) {
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
          await stripe.refunds.create({
            payment_intent: booking.stripe_payment_intent_id,
          });
        }
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          refund_status: 'full_refund_processed',
          refund_amount: booking.price_paid,
          refunded_at: new Date(),
          rebook_eligible: false,
          choice_token_used_at: new Date(),
        }
      });

      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #29ABE2;">Full Refund Processed</h2>
            <p>Thank you! Your full refund of <strong>£${Number(booking.price_paid).toFixed(2)}</strong> has been processed to your original payment method.</p>
            <p style="color: #64748b; font-size: 14px;">Please allow 5-10 business days for the funds to reflect in your account statement.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' }, status: 200 });
    } else {
      // action === 'rebook'
      const { token: rebookToken, expiresAt: rebookExpiresAt } = generateBookingToken(30);

      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          refund_status: 'rebook_chosen',
          rebook_eligible: true,
          rebook_used: false,
          choice_token_used_at: new Date(),
          rebook_token: rebookToken,
          rebook_token_expires_at: rebookExpiresAt,
          rebook_token_used_at: null,
        },
        include: { user: true, session: { include: { course: true } } }
      });

      try {
        await sendRebookInviteEmail(updatedBooking);
      } catch (e) {
        console.error('Failed to send rebook invite email:', e);
      }

      return new NextResponse(`
        <html>
          <body style="font-family: sans-serif; padding: 40px; text-align: center; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8DC63F;">Free Rebook Confirmed</h2>
            <p>Thank you! You have selected a free rebook for <strong>${booking.session.course.title}</strong>.</p>
            <p style="color: #64748b; font-size: 14px;">Your account has been flagged for a free rebooking. You can use your booking reference (<strong>${booking.booking_reference}</strong>) to select an upcoming course date.</p>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' }, status: 200 });
    }

  } catch (error: any) {
    console.error("Booking Choice Action Error:", error);
    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2 style="color: #ef4444;">Action Error</h2>
          <p>An error occurred processing your request. Please contact support at info@uachieve.co.uk.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' }, status: 500 });
  }
}
