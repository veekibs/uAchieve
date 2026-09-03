import { Resend } from 'resend';
import { formatTimeRange } from '@/lib/time';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  return new Resend(apiKey);
};

export async function sendCompletionEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Training Completed: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Congratulations, ${studentName}!</h2>
        <p>You have successfully completed your training for <strong>${courseTitle}</strong> on ${sessionDate}.</p>
        <p>Your certificate will be available via the WorkSafe App once your instructor has registered your details with WorkSafe (this may take a few days). To access it, you'll need: your unique student number (printed on your evaluation form), your course end date, and your email address.</p>
        <p>Download the WorkSafe App: <a href="https://apps.apple.com/us/app/worksafe-training-systems/id1504688269" style="color: #29ABE2; font-weight: bold;">iOS</a> | <a href="https://play.google.com/store/apps/details?id=uk.co.worksafetraining.worksafe" style="color: #29ABE2; font-weight: bold;">Android</a></p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendNoShowEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Missed Session Notice: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">We missed you!</h2>
        <p>Hi ${studentName},</p>
        <p>We noticed you weren't able to attend the scheduled <strong>${courseTitle}</strong> session on ${sessionDate}.</p>
        <p>No worries! As part of our policy, you are eligible for <strong>one free rebook</strong> to get yourself trained.</p>
        <p>To arrange your new session, please contact us directly at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a> with your booking reference (<strong>${booking.booking_reference}</strong>) and your preferred upcoming dates.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendCertificateReadyEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Your Certificate is Ready: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Your Certificate is Ready!</h2>
        <p>Hi ${studentName},</p>
        <p>Good news! Your details for <strong>${courseTitle}</strong> have now been registered with WorkSafe.</p>
        <p>You can now access your official certificate via the WorkSafe App using:</p>
        <ul>
          <li>Your unique student number (printed on your evaluation form)</li>
          <li>Your course end date</li>
          <li>Your email address</li>
        </ul>
        <p>Download the WorkSafe App: <a href="https://apps.apple.com/us/app/worksafe-training-systems/id1504688269" style="color: #29ABE2; font-weight: bold;">iOS</a> | <a href="https://play.google.com/store/apps/details?id=uk.co.worksafetraining.worksafe" style="color: #29ABE2; font-weight: bold;">Android</a></p>
        <p>If you have any issues accessing your certificate, please contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a>.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendCancellationEmail(booking: any, refundMessage: string) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Session Cancelled: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">Session Cancellation Notice</h2>
        <p>Hi ${studentName},</p>
        <p>We are writing to inform you that your upcoming <strong>${courseTitle}</strong> session scheduled for ${sessionDate} has unfortunately been cancelled.</p>
        <p><strong>Refund / Rebooking Status:</strong></p>
        <p>${refundMessage}</p>
        <p>If you would like to arrange a rebooking for another date, please contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a> with your booking reference (<strong>${booking.booking_reference}</strong>).</p>
        <p>We apologize for any inconvenience this may cause.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendCapacityExceededEmail(toEmail: string, name: string, courseTitle: string, sessionDate: string) {
  const resend = getResendClient();
  const studentName = name || 'Customer';

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: toEmail,
    subject: `Important Update Regarding Your Booking: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">Session Full - Full Refund Issued</h2>
        <p>Hi ${studentName},</p>
        <p>Thank you for choosing UAchieve. We are writing regarding your booking attempt for <strong>${courseTitle}</strong> on <strong>${sessionDate}</strong>.</p>
        <p>Due to simultaneous checkouts, this session reached maximum capacity just as your payment was processed.</p>
        <p>Because we strictly enforce small class sizes to ensure high quality training, we have automatically issued a <strong>full refund</strong> to your payment method. Please allow 5-10 business days for the funds to reflect in your account.</p>
        <p>We sincerely apologize for the inconvenience and would love to help you get booked into an alternative upcoming date. Please contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a> to discuss available dates.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendAdminRefundAlertEmail({
  customerEmail,
  sessionId,
  paymentIntentId,
  errorMessage,
}: {
  customerEmail: string;
  sessionId: string;
  paymentIntentId?: string;
  errorMessage: string;
}) {
  const resend = getResendClient();

  await resend.emails.send({
    from: 'UAchieve System <onboarding@resend.dev>',
    to: 'info@uachieve.co.uk',
    subject: `🚨 ACTION REQUIRED: Overbooking Refund Failure for ${customerEmail}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #ef4444; border-radius: 12px; background-color: #fef2f2;">
        <h2 style="color: #dc2626; margin-top: 0; margin-bottom: 20px;">🚨 Critical Refund Failure Alert</h2>
        <p>A customer's payment succeeded when a training session reached capacity, but the automatic Stripe refund <strong>FAILED</strong> and requires manual administrator action in Stripe.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px;">Customer Email:</td>
              <td style="padding: 6px 0;">${customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Session ID:</td>
              <td style="padding: 6px 0; font-family: monospace;">${sessionId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Payment Intent ID:</td>
              <td style="padding: 6px 0; font-family: monospace;">${paymentIntentId || 'N/A (Missing)'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; vertical-align: top;">Error Details:</td>
              <td style="padding: 6px 0; color: #dc2626; font-family: monospace;">${errorMessage}</td>
            </tr>
          </table>
        </div>

        <p><strong>Action Required:</strong> Please log into your <a href="https://dashboard.stripe.com" style="color: #dc2626; font-weight: bold;">Stripe Dashboard</a>, look up Payment Intent <code>${paymentIntentId || 'N/A'}</code> or customer <code>${customerEmail}</code>, and manually process a full refund.</p>
        
        <p style="font-size: 12px; color: #7f1d1d;">UAchieve System Alert</p>
      </div>
    `
  });
}

export async function sendStudentCancellationRefundEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Booking Cancelled & Refunded: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Booking Cancellation Confirmed</h2>
        <p>Hi ${studentName},</p>
        <p>Your booking for <strong>${courseTitle}</strong> on ${sessionDate} has been cancelled.</p>
        <p>Because you cancelled more than 14 days before the session date, a <strong>full refund of £${Number(booking.price_paid).toFixed(2)}</strong> has been issued to your payment method. Please allow 5-10 business days for the funds to reflect in your account.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendStudentCancellationRebookEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Booking Cancelled (Rebook Eligible): ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Booking Cancellation Update</h2>
        <p>Hi ${studentName},</p>
        <p>Your booking for <strong>${courseTitle}</strong> on ${sessionDate} has been cancelled.</p>
        <p>Per our cancellation policy, bookings cancelled less than 14 days before the course date are non-refundable. However, your account has been marked as <strong>eligible for a free rebook</strong>.</p>
        <p>To choose an upcoming date, please contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a> with your booking reference (<strong>${booking.booking_reference}</strong>).</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendAdminCancellationChoiceEmail(booking: any) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uachieve.co.uk';
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const refundLink = `${baseUrl}/api/bookings/choice?token=${booking.choice_token}&action=refund`;
  const rebookLink = `${baseUrl}/api/bookings/choice?token=${booking.choice_token}&action=rebook`;

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Important: Session Cancelled - Action Required (${courseTitle})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">Important Update Regarding Your Training</h2>
        <p>Hi ${studentName},</p>
        <p>We regret to inform you that your upcoming training session for <strong>${courseTitle}</strong> on ${sessionDate} has been cancelled by UAchieve.</p>
        <p>Because this session was cancelled with less than 2 weeks notice, you are eligible to choose how you would like to proceed:</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${refundLink}" style="display: inline-block; background-color: #29ABE2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-right: 10px; margin-bottom: 10px;">Choose Full Refund</a>
          <a href="${rebookLink}" style="display: inline-block; background-color: #8DC63F; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-bottom: 10px;">Choose Free Rebook</a>
        </div>

        <p>Please click one of the buttons above to confirm your choice. If you have any questions, contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a>.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendNoShowExhaustedEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Attendance Update: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #EF4444; margin-top: 0; margin-bottom: 20px;">Missed Session Notice</h2>
        <p>Hi ${studentName},</p>
        <p>We noticed you were unable to attend your scheduled <strong>${courseTitle}</strong> session.</p>
        <p>Per our policy, each student is eligible for a maximum of 1 free rebook. Since you have previously utilized your free rebook option, this booking cannot be transferred again.</p>
        <p>If you wish to complete your training, please visit our website to book a new session. If you believe this is an error, contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a>.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendRebookInviteEmail(booking: any) {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uachieve.co.uk';
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const rebookLink = `${baseUrl}/rebook?token=${booking.rebook_token}`;

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Select Your New Date: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Choose Your New Course Date</h2>
        <p>Hi ${studentName},</p>
        <p>Your account is eligible to select a new date for <strong>${courseTitle}</strong> at no extra cost.</p>
        <p>Please click the button below to view available upcoming dates and transfer your booking (link expires in 30 days):</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${rebookLink}" style="display: inline-block; background-color: #8DC63F; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Select New Date</a>
        </div>

        <p>If you have any questions, contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a>.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendRebookConfirmationEmail(newBooking: any) {
  const resend = getResendClient();
  const studentEmail = newBooking.user.email;
  const studentName = newBooking.user.first_name || 'Student';
  const courseTitle = newBooking.session.course.title;
  const venueName = newBooking.session.venue_name || 'TBA';
  const venueAddress = newBooking.session.venue_address || 'TBA';

  const sessionDate = new Date(newBooking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Rebooking Confirmed: ${courseTitle} (${newBooking.booking_reference})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #8DC63F; margin-top: 0; margin-bottom: 20px;">Your Rebooking is Confirmed!</h2>
        <p>Hi ${studentName},</p>
        <p>Your training session transfer has been completed successfully. Your new details are below:</p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px;">Course:</td>
              <td style="padding: 6px 0;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">New Booking Ref:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 14px; color: #29ABE2; font-weight: bold;">${newBooking.booking_reference}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">New Date:</td>
              <td style="padding: 6px 0;">${sessionDate}</td>
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

        <p>Please arrive 10-15 minutes before the scheduled start time.</p>
        <p style="font-size: 13px; color: #64748b;">If you have any questions, contact us at <a href="mailto:info@uachieve.co.uk" style="color: #29ABE2;">info@uachieve.co.uk</a>.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendAdminCancellation14DaysNoticeEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Notice: Session Reschedule Needed (${courseTitle})`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Session Reschedule Notice</h2>
        <p>Hi ${studentName},</p>
        <p>We are writing regarding your upcoming <strong>${courseTitle}</strong> training session scheduled for ${sessionDate}.</p>
        <p>We need to reschedule your session. Ann will be in touch shortly to arrange a new date with you directly.</p>
        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendSessionReminderEmail(booking: any, type: '1_week' | '24_hour') {
  const resend = getResendClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://uachieve.co.uk';
  const studentEmail = booking.user.email;
  const studentName = booking.user.first_name || 'Student';
  const courseTitle = booking.session.course.title;
  const venueName = booking.session.venue_name || 'TBA';
  const venueAddress = booking.session.venue_address || 'TBA';

  const sessionDate = new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const timeString = formatTimeRange(booking.session.start_time, booking.session.end_time);
  const timeframeText = type === '1_week' ? '1 week' : '24 hours';
  const subjectPrefix = type === '1_week' ? 'Upcoming Training Reminder (1 Week)' : 'Tomorrow: Your Training Session Reminder';

  const cancelLink = `${baseUrl}/profile`;

  await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `${subjectPrefix}: ${courseTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #29ABE2; margin-top: 0; margin-bottom: 20px;">Course Reminder: ${courseTitle}</h2>
        <p>Hi ${studentName},</p>
        <p>This is a quick reminder that your training session for <strong>${courseTitle}</strong> is coming up in <strong>${timeframeText}</strong>!</p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; width: 140px;">Booking Ref:</td>
              <td style="padding: 6px 0; font-family: monospace; font-size: 14px; color: #29ABE2; font-weight: bold;">${booking.booking_reference}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Date:</td>
              <td style="padding: 6px 0;">${sessionDate}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold;">Time:</td>
              <td style="padding: 6px 0;">${timeString}</td>
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

        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 8px; font-size: 15px;">What to Bring:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
            <li><strong>Photo ID</strong> (Passport, Driving License, or National ID)</li>
            <li><strong>Comfortable practical clothing</strong> (suitable for floor work and hands-on CPR practice)</li>
            <li>Writing pen and notepad for course notes</li>
          </ul>
        </div>

        <p style="font-size: 13px; color: #64748b;">
          Need to review or manage your booking? Please contact us at <a href="mailto:info@uachieve.co.uk">info@uachieve.co.uk</a>.
        </p>

        <p>Best regards,<br/><strong>UAchieve Team</strong></p>
      </div>
    `
  });
}

export async function sendSessionUpdatedEmail(booking: any) {
  const resend = getResendClient();
  const studentEmail = booking.user?.email || booking.email;
  if (!studentEmail) {
    console.warn("sendSessionUpdatedEmail: No student email found on booking object", booking.id);
    return;
  }
  const studentName = booking.user?.first_name || 'Student';
  const courseTitle = booking.session?.course?.title || 'First Aid Training';
  const venueName = booking.session?.venue_name || 'TBA';
  const venueAddress = booking.session?.venue_address || 'TBA';

  const sessionDate = booking.session?.date ? new Date(booking.session.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : 'Scheduled date';

  const timeString = formatTimeRange(booking.session?.start_time, booking.session?.end_time);

  const sendResult = await resend.emails.send({
    from: 'UAchieve <onboarding@resend.dev>',
    to: studentEmail,
    subject: `Important Update: Your ${courseTitle} Session Details Have Changed`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; line-height: 1.6; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="border-bottom: 2px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 24px;">
          <h1 style="color: #29ABE2; margin: 0; font-size: 22px; font-weight: 700;">UAchieve Training Update</h1>
        </div>

        <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 12px; font-size: 18px;">Your Session Details Have Been Updated</h2>
        <p>Hi ${studentName},</p>
        <p>Please note that Ann has updated the scheduled details for your upcoming <strong>${courseTitle}</strong> training course. Your new confirmed session information is provided below:</p>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b; width: 140px;">Booking Ref:</td>
              <td style="padding: 8px 0; font-family: monospace; font-size: 15px; color: #29ABE2; font-weight: 700;">${booking.booking_reference}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Course:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${courseTitle}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b;">New Date:</td>
              <td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${sessionDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Time:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">${timeString}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b; vertical-align: top;">Venue:</td>
              <td style="padding: 8px 0; color: #0f172a;">
                <strong style="font-size: 15px;">${venueName}</strong><br/>
                <span style="color: #64748b; font-size: 13px;">${venueAddress}</span>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #0369a1; margin-top: 0; margin-bottom: 8px; font-size: 15px; font-weight: 600;">What to Bring on the Day:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px; line-height: 1.5;">
            <li><strong>Photo ID</strong> (Passport, Driving Licence, or National ID)</li>
            <li><strong>Comfortable clothing</strong> suitable for practical CPR floor exercises</li>
            <li>A pen and notebook if you wish to take personal notes</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #475569; margin-bottom: 24px;">
          If this new date, time, or location is no longer suitable for you, please contact us at <a href="mailto:info@uachieve.co.uk" style="color: #29ABE2; font-weight: 600; text-decoration: underline;">info@uachieve.co.uk</a> so we can arrange an alternative for you.
        </p>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; color: #64748b; font-size: 13px;">
          <p style="margin: 0;">Best regards,<br/><strong style="color: #1e293b;">Ann & the UAchieve Team</strong></p>
          <p style="margin: 4px 0 0 0;"><a href="mailto:info@uachieve.co.uk" style="color: #29ABE2;">info@uachieve.co.uk</a> | <a href="https://uachieve.co.uk" style="color: #29ABE2;">uachieve.co.uk</a></p>
        </div>
      </div>
    `
  });

  if (sendResult.error) {
    console.error(`🚨 RESEND_ERROR [sendSessionUpdatedEmail to ${studentEmail}]:`, sendResult.error);
    throw new Error(`Resend send failed: ${sendResult.error.message}`);
  }

  console.log(`✅ RESEND_SUCCESS [sendSessionUpdatedEmail to ${studentEmail}]: Email ID ${sendResult.data?.id}`);
  return sendResult;
}
