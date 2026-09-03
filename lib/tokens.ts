import crypto from 'crypto';
import prisma from '@/lib/prisma/client';

/**
 * Generates a cryptographically secure random token with 30-day expiration
 */
export function generateBookingToken(daysValid: number = 30) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + daysValid);
  return { token, expiresAt };
}

/**
 * Validates a single-use token from the database
 */
export async function validateBookingToken(token: string) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'invalid_token_format' };
  }

  const booking = await prisma.booking.findUnique({
    where: { choice_token: token },
    include: { user: true, session: { include: { course: true } } }
  });

  if (!booking) {
    return { valid: false, reason: 'not_found' };
  }

  if (booking.choice_token_used_at) {
    return { valid: false, reason: 'already_used', booking };
  }

  if (booking.choice_token_expires_at && new Date() > new Date(booking.choice_token_expires_at)) {
    return { valid: false, reason: 'expired', booking };
  }

  return { valid: true, booking };
}

/**
 * Validates a single-use rebook token from the database
 */
export async function validateRebookToken(token: string) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'invalid_token_format' };
  }

  const booking = await prisma.booking.findUnique({
    where: { rebook_token: token },
    include: { user: true, session: { include: { course: true } } }
  });

  if (!booking) {
    return { valid: false, reason: 'not_found' };
  }

  if (booking.rebook_token_used_at || booking.rebook_used) {
    return { valid: false, reason: 'already_used', booking };
  }

  if (booking.rebook_token_expires_at && new Date() > new Date(booking.rebook_token_expires_at)) {
    return { valid: false, reason: 'expired', booking };
  }

  return { valid: true, booking };
}

