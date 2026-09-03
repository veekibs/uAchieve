import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma/client';
import { Resend } from 'resend';
import { formatTimeString } from '@/lib/time';
import { sendCapacityExceededEmail, sendAdminRefundAlertEmail } from '@/lib/email/sender';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('Stripe webhook error: No signature found');
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error(`Stripe webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const { 
        sessionId, 
        userEmail, 
        firstName, 
        surname, 
        phone, 
        companyName,
        smsConsent
      } = session.metadata || {};

      if (!sessionId || !userEmail) {
        console.error('Stripe webhook error: Missing sessionId or userEmail in metadata');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Idempotency: query-first check to see if booking already exists
      const existingBooking = await prisma.booking.findUnique({
        where: { stripe_checkout_session_id: session.id }
      });

      if (existingBooking) {
        console.log(`Booking for checkout session ${session.id} already exists. Skipping.`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const bookingRef = `uA-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      const pricePaid = session.amount_total ? session.amount_total / 100 : 0;

      class CapacityExceededError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CapacityExceededError';
        }
      }

      let createdBooking: any;
      try {
        createdBooking = await prisma.$transaction(async (tx) => {
          // 1. Lock the session row to serialize concurrent booking attempts for this session
          await tx.$queryRaw`SELECT id FROM sessions WHERE id = ${sessionId}::uuid FOR UPDATE`;

          // 2. Fetch session max capacity and count confirmed bookings under lock
          const sessionRecord = await tx.session.findUnique({
            where: { id: sessionId },
            select: { max_capacity: true }
          });

          if (!sessionRecord) {
            throw new Error(`Session ${sessionId} not found`);
          }

          const currentBookingsCount = await tx.booking.count({
            where: { session_id: sessionId }
          });

          // 3. Atomically enforce max_capacity
          if (currentBookingsCount >= sessionRecord.max_capacity) {
            throw new CapacityExceededError(`Session ${sessionId} has reached max capacity (${sessionRecord.max_capacity}).`);
          }

          const user = await tx.user.upsert({
            where: { email: userEmail.toLowerCase() },
            update: {
              first_name: firstName || undefined,
              last_name: surname || undefined,
              phone: phone || undefined,
              company_name: companyName || undefined,
            },
            create: {
              email: userEmail.toLowerCase(),
              first_name: firstName || 'Unknown',
              last_name: surname || 'Unknown',
              phone: phone || null,
              company_name: companyName || null,
              role: 'student',
            }
          });

          const isSmsConsent = smsConsent === 'true';

          return await tx.booking.create({
            data: {
              user_id: user.id,
              session_id: sessionId,
              booking_reference: bookingRef,
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id: session.payment_intent as string | undefined,
              payment_status: 'paid',
              price_paid: pricePaid,
              sms_consent: isSmsConsent,
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
      } catch (err: any) {
        if (err instanceof CapacityExceededError || err?.name === 'CapacityExceededError') {
          console.error(`🚨 OVERBOOKING ALERT: Session ${sessionId} reached capacity during payment by ${userEmail}.`);
          
          // 1. Process Stripe Refund
          let refundSuccess = false;
          try {
            if (session.payment_intent) {
              await stripe.refunds.create({
                payment_intent: session.payment_intent as string,
                reason: 'duplicate',
              });
              refundSuccess = true;
              console.log(`✅ Refund successful for payment intent ${session.payment_intent} (${userEmail})`);
            } else {
              const errMsg = `No payment_intent found on checkout session ${session.id}`;
              console.error(`🚨 CRITICAL OVERBOOKING REFUND FAILURE: ${errMsg} for ${userEmail}! Manual admin refund required.`);
              try {
                await sendAdminRefundAlertEmail({
                  customerEmail: userEmail,
                  sessionId,
                  paymentIntentId: undefined,
                  errorMessage: errMsg
                });
              } catch (adminEmailErr) {
                console.error("Failed to send admin refund alert email:", adminEmailErr);
              }
            }
          } catch (refundErr: any) {
            const errMsg = refundErr?.message || String(refundErr);
            console.error(`🚨 CRITICAL OVERBOOKING REFUND FAILURE: Stripe refund call failed for ${userEmail} (Payment Intent: ${session.payment_intent}):`, refundErr);
            try {
              await sendAdminRefundAlertEmail({
                customerEmail: userEmail,
                sessionId,
                paymentIntentId: session.payment_intent as string | undefined,
                errorMessage: errMsg
              });
            } catch (adminEmailErr) {
              console.error("Failed to send admin refund alert email:", adminEmailErr);
            }
          }

          // 2. Dispatch Apology Email
          try {
            const targetSession = await prisma.session.findUnique({
              where: { id: sessionId },
              include: { course: true }
            });
            const courseTitle = targetSession?.course?.title || 'Training Course';
            const sessionDate = targetSession?.date 
              ? new Date(targetSession.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : 'scheduled date';

            await sendCapacityExceededEmail(userEmail, firstName || 'Customer', courseTitle, sessionDate);
            console.log(`Apology email sent to ${userEmail} regarding full session.`);
          } catch (emailErr) {
            console.error(`Failed to send capacity exceeded email to ${userEmail}:`, emailErr);
          }

          return NextResponse.json({ 
            error: 'Session capacity exceeded. Refund and apology email processed.',
            refundSuccess 
          }, { status: 200 }); // Return 200 to Stripe so webhook acknowledges
        }

        // Re-throw other unexpected transaction errors
        throw err;
      }

      console.log(`Successfully created booking for ${userEmail} (Ref: ${bookingRef})`);

      // Dispatch booking confirmation email via Resend after transaction commits
      try {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
          throw new Error("Missing RESEND_API_KEY environment variable");
        }

        const resend = new Resend(apiKey);
        const studentEmail = createdBooking.user.email;
        const studentName = createdBooking.user.first_name || 'Student';
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
          from: 'UAchieve <onboarding@resend.dev>',
          to: studentEmail,
          subject: `Booking Confirmed: ${courseTitle} (${bookingRef})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Your Booking is Confirmed!</h2>
              <p>Hi ${studentName},</p>
              <p>Thank you for booking with UAchieve. Your booking details are summarized below:</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; width: 140px;">Course:</td>
                    <td style="padding: 6px 0;">${courseTitle}</td>
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

              <div style="margin: 20px 0; font-size: 13px; color: #475569; background-color: #f8fafc; border-left: 4px solid #cbd5e1; padding: 12px; border-radius: 4px; line-height: 1.5;">
                <strong>Cancellation Policy:</strong> 2+ weeks before your course: full refund. Less than 2 weeks before: rebook only (no refund). Read our <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://uachieve.co.uk'}/policies/cancellation" style="color: #29ABE2; text-decoration: underline;">full policy</a> for more details.

              <p>If you have any questions or need to cancel/reschedule, please contact us at <a href="mailto:info@uachieve.co.uk" style="color: #29ABE2; text-decoration: underline;">info@uachieve.co.uk</a>.</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">This email is sent on behalf of UAchieve Training.</p>
            </div>
          `
        });
        console.log(`Booking confirmation email sent via Resend to ${studentEmail} (Ref: ${bookingRef})`);
      } catch (emailErr) {
        console.error("Resend booking confirmation email failed:", emailErr);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('Unhandled webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}