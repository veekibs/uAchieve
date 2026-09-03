import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as emailSender from '@/lib/email/sender';

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe('TEST-005 · Email Templates Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockResolvedValue({ data: { id: 'test-email-id' }, error: null });
    process.env.RESEND_API_KEY = 're_test_key_123';
  });

  const mockBooking = {
    id: 'booking-123',
    booking_reference: 'uA-BLS99',
    user: {
      first_name: 'Jane',
      last_name: 'Doe',
      email: 'jane.doe@example.com',
    },
    session: {
      id: 'session-456',
      date: '2026-10-17T00:00:00.000Z',
      start_time: '09:00:00',
      end_time: '13:00:00',
      venue_name: 'Bedford Central Training Hall',
      venue_address: '123 High St, Bedford',
      course: {
        title: 'Basic Life Support (BLS)',
      },
    },
    choice_token: 'valid-choice-token-abc',
    rebook_token: 'valid-rebook-token-xyz',
  };

  it('1. Booking completion email: asserts subject, student name, course, and no null/undefined in body', async () => {
    await emailSender.sendCompletionEmail(mockBooking);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe('jane.doe@example.com');
    expect(callArgs.subject).toContain('Training Completed: Basic Life Support (BLS)');
    expect(callArgs.html).toContain('Jane');
    expect(callArgs.html).toContain('Basic Life Support (BLS)');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).not.toContain('null');
    expect(callArgs.html).toContain('WorkSafe App');
  });

  it('2. 1-week session reminder email: asserts subject, venue, formatted time, and no null/undefined in body', async () => {
    await emailSender.sendSessionReminderEmail(mockBooking, '1_week');

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe('jane.doe@example.com');
    expect(callArgs.subject).toContain('Upcoming Training Reminder (1 Week)');
    expect(callArgs.html).toContain('Jane');
    expect(callArgs.html).toContain('Basic Life Support (BLS)');
    expect(callArgs.html).toContain('Bedford Central Training Hall');
    expect(callArgs.html).toContain('9:00 AM');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).not.toContain('null');
    expect(callArgs.html).toContain('info@uachieve.co.uk');
  });

  it('3. 24-hour session reminder email: asserts subject, urgent notice, venue, and support contact', async () => {
    await emailSender.sendSessionReminderEmail(mockBooking, '24_hour');

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe('jane.doe@example.com');
    expect(callArgs.subject).toContain('Tomorrow: Your Training Session Reminder');
    expect(callArgs.html).toContain('Jane');
    expect(callArgs.html).toContain('Bedford Central Training Hall');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).not.toContain('null');
    expect(callArgs.html).toContain('info@uachieve.co.uk');
  });

  it('4. Session cancellation email (UAchieve cancels): asserts choice options (refund vs rebook link) and student details', async () => {
    await emailSender.sendAdminCancellationChoiceEmail(mockBooking);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe('jane.doe@example.com');
    expect(callArgs.subject).toContain('Important: Session Cancelled - Action Required');
    expect(callArgs.html).toContain('Jane');
    expect(callArgs.html).toContain('Basic Life Support (BLS)');
    expect(callArgs.html).toContain('action=refund');
    expect(callArgs.html).toContain('action=rebook');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).not.toContain('null');
    expect(callArgs.html).toContain('info@uachieve.co.uk');
  });

  it('5. No-show rebook email: asserts missed session notice, free rebook notice, and support email', async () => {
    await emailSender.sendNoShowEmail(mockBooking);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe('jane.doe@example.com');
    expect(callArgs.subject).toContain('Missed Session Notice: Basic Life Support (BLS)');
    expect(callArgs.html).toContain('Jane');
    expect(callArgs.html).toContain('Basic Life Support (BLS)');
    expect(callArgs.html).toContain('one free rebook');
    expect(callArgs.html).toContain('info@uachieve.co.uk');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).not.toContain('null');
  });

  it('6. Rebooking confirmation email: asserts updated booking reference and venue details', async () => {
    const newBooking = {
      ...mockBooking,
      booking_reference: 'uA-REBOOK88',
      session: {
        ...mockBooking.session,
        venue_name: 'Dunstable Community Hall',
      },
    };

    await emailSender.sendRebookConfirmationEmail(newBooking);

    expect(mockSend).toHaveBeenCalledTimes(1);
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.to).toBe('jane.doe@example.com');
    expect(callArgs.subject).toContain('Rebooking Confirmed: Basic Life Support');
    expect(callArgs.html).toContain('Jane');
    expect(callArgs.html).toContain('uA-REBOOK88');
    expect(callArgs.html).toContain('Dunstable Community Hall');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).not.toContain('null');
    expect(callArgs.html).toContain('info@uachieve.co.uk');
  });

  it('7. Handles fallback gracefully when venue is TBC or student name is missing', async () => {
    const tbcBooking = {
      id: 'booking-tbc',
      booking_reference: 'uA-TBC01',
      user: {
        first_name: null,
        last_name: null,
        email: 'anon@example.com',
      },
      session: {
        id: 'session-tbc',
        date: '2026-11-14T00:00:00.000Z',
        start_time: '09:00:00',
        end_time: '13:00:00',
        venue_name: 'TBC',
        venue_address: null,
        course: {
          title: 'Emergency First Aid at Work',
        },
      },
      rebook_token: 'token-123',
    };

    await emailSender.sendSessionReminderEmail(tbcBooking, '1_week');
    const callArgs = mockSend.mock.calls[0][0];

    expect(callArgs.html).not.toContain('null');
    expect(callArgs.html).not.toContain('undefined');
    expect(callArgs.html).toContain('Student'); // fallback name
  });
});
