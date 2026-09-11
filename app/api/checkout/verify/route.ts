import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma/client';
import { Resend } from 'resend';
import { formatTimeString } from '@/lib/time';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const stripe = stripeKey ? new Stripe(stripeKey) : null;

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
    if (stripe) {
      try {
        stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
      } catch (stripeErr) {
        console.error("Failed to retrieve Stripe session:", stripeErr);
      }
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

      // 3. Fallback Auto-Finalization: Payment is paid, finalize booking immediately if webhook hasn't run yet
      if (stripeSession.payment_status === 'paid') {
        const metadata = stripeSession.metadata || {};
        const targetSessionId = metadata.sessionId;
        const userEmail = metadata.userEmail || stripeSession.customer_email;
        const firstName = metadata.firstName || '';
        const surname = metadata.surname || '';
        const phone = metadata.phone || null;
        const companyName = metadata.companyName || null;
        const courseType = metadata.courseType || 'first-time';
        const smsConsent = metadata.smsConsent === 'true';
        const pricePaid = stripeSession.amount_total ? stripeSession.amount_total / 100 : 0;

        if (targetSessionId && userEmail) {
          const bookingRef = `uA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

          const createdBooking = await prisma.$transaction(async (tx) => {
            const user = await tx.user.upsert({
              where: { email: userEmail.toLowerCase().trim() },
              update: {
                first_name: firstName || undefined,
                last_name: surname || undefined,
                phone: phone || undefined,
                company_name: companyName || undefined,
              },
              create: {
                email: userEmail.toLowerCase().trim(),
                first_name: firstName || 'Unknown',
                last_name: surname || 'Unknown',
                phone: phone || null,
                company_name: companyName || null,
                role: 'student',
              }
            });

            return await tx.booking.create({
              data: {
                user_id: user.id,
                session_id: targetSessionId,
                booking_reference: bookingRef,
                stripe_checkout_session_id: stripeSession.id,
                stripe_payment_intent_id: typeof stripeSession.payment_intent === 'string' ? stripeSession.payment_intent : undefined,
                payment_status: 'paid',
                price_paid: pricePaid,
                course_type: courseType,
                sms_consent: smsConsent,
                booked_at: new Date(),
              },
              include: {
                user: true,
                session: {
                  include: {
                    course: true
                  }
                }
              }
            });
          });

          // Dispatch booking confirmation email via Resend
          try {
            const apiKey = process.env.RESEND_API_KEY;
            if (apiKey) {
              const resend = new Resend(apiKey);
              const fromEmail = process.env.NOREPLY_EMAIL || 'UAchieve <onboarding@resend.dev>';
              const courseTitle = createdBooking.session.course.title;
              const venueName = createdBooking.session.venue_name || 'TBA';
              const venueAddress = createdBooking.session.venue_address || 'TBA';
              const sessionDate = new Date(createdBooking.session.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
              const startTime = formatTimeString(createdBooking.session.start_time);
              const endTime = formatTimeString(createdBooking.session.end_time);

              await resend.emails.send({
                from: fromEmail,
                to: userEmail,
                subject: `Booking Confirmed: ${courseTitle} (${bookingRef})`,
                html: `
                  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Your Booking is Confirmed!</h2>
                    <p>Hi ${firstName || 'Student'},</p>
                    <p>Thank you for booking with UAchieve. Your booking details are summarized below:</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 6px 0; font-weight: bold; width: 140px;">Course:</td>
                          <td style="padding: 6px 0;">${courseTitle}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-weight: bold;">Training Type:</td>
                          <td style="padding: 6px 0;">${courseType === 'refresher' ? 'Certificate Renewal / Refresher' : 'First-Time Training'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-weight: bold;">Booking Ref:</td>
                          <td style="padding: 6px 0; font-family: monospace; font-size: 14px; color: #29ABE2; font-weight: bold;">${bookingRef}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-weight: bold;">Date:</td>
                          <td style="padding: 6px 0;">${sessionDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-weight: bold;">Time:</td>
                          <td style="padding: 6px 0;">${startTime} - ${endTime}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Venue:</td>
                          <td style="padding: 6px 0;">
                            <strong>${venueName}</strong><br/>
                            <span style="color: #64748b; font-size: 13px;">${venueAddress}</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="margin: 20px 0;">
                      <strong style="display: block; margin-bottom: 8px;">What to bring:</strong>
                      <ul style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 6px;">Comfortable clothing (practical, hands-on training including CPR practice)</li>
                        <li style="margin-bottom: 6px;">Photo ID</li>
                      </ul>
                    </div>

                    <p>Please arrive 10-15 minutes before the scheduled start time.</p>
                    <p>Best regards,<br/><strong>UAchieve Team</strong></p>
                  </div>
                `
              });
            }
          } catch (emailErr) {
            console.error("Failed to send booking confirmation email:", emailErr);
          }

          return NextResponse.json({
            status: 'confirmed',
            booking: {
              id: createdBooking.id,
              booking_reference: createdBooking.booking_reference,
              userEmail: createdBooking.user.email,
              studentName: `${createdBooking.user.first_name || ''} ${createdBooking.user.last_name || ''}`.trim(),
              courseTitle: createdBooking.session.course.title,
              date: createdBooking.session.date,
              start_time: createdBooking.session.start_time,
              end_time: createdBooking.session.end_time,
              venue_name: createdBooking.session.venue_name,
              venue_address: createdBooking.session.venue_address,
              price_paid: createdBooking.price_paid,
            }
          }, { status: 200 });
        }
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

