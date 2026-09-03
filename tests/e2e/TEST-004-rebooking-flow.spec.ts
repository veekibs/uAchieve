import { test, expect } from '@playwright/test';
import { getOrCreateTestCourse, createOrGetUpcomingTestSession, cleanupTestSession } from '../fixtures/db';
import { prisma } from '@/lib/prisma/client';
import { generateBookingToken } from '@/lib/tokens';

test.describe('TEST-004 · Rebooking flow E2E', () => {
  let courseId: string;
  let oldSessionId: string;
  let newSessionId: string;
  let validToken: string;
  let expiredToken: string;
  let usedToken: string;
  let testUserId: string;

  test.beforeAll(async () => {
    const course = await getOrCreateTestCourse('basic-life-support', 'Basic Life Support (BLS)');
    courseId = course.id;

    const oldSession = await createOrGetUpcomingTestSession(courseId, { venueName: 'Old Training Venue' });
    oldSessionId = oldSession.id;

    const newSession = await createOrGetUpcomingTestSession(courseId, { venueName: 'New Training Venue' });
    newSessionId = newSession.id;

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        email: `rebook.student.${Date.now()}@example.com`,
        first_name: 'RebookStudent',
        last_name: 'Tester',
        role: 'student',
      },
    });
    testUserId = testUser.id;

    // 1. Valid Token Booking
    const validTokenData = generateBookingToken(30);
    validToken = validTokenData.token;
    await prisma.booking.create({
      data: {
        user_id: testUserId,
        session_id: oldSessionId,
        booking_reference: `uA-VALID${Math.floor(Math.random()*1000)}`,
        payment_status: 'paid',
        price_paid: 75.0,
        status: 'cancelled_by_admin',
        rebook_eligible: true,
        rebook_used: false,
        rebook_token: validToken,
        rebook_token_expires_at: validTokenData.expiresAt,
      },
    });

    // 2. Expired Token Booking
    const expiredTokenData = generateBookingToken(-5); // Expired 5 days ago
    expiredToken = expiredTokenData.token;
    await prisma.booking.create({
      data: {
        user_id: testUserId,
        session_id: oldSessionId,
        booking_reference: `uA-EXP${Math.floor(Math.random()*1000)}`,
        payment_status: 'paid',
        price_paid: 75.0,
        status: 'cancelled_by_admin',
        rebook_eligible: true,
        rebook_used: false,
        rebook_token: expiredToken,
        rebook_token_expires_at: expiredTokenData.expiresAt,
      },
    });

    // 3. Used Token Booking
    const usedTokenData = generateBookingToken(30);
    usedToken = usedTokenData.token;
    await prisma.booking.create({
      data: {
        user_id: testUserId,
        session_id: oldSessionId,
        booking_reference: `uA-USED${Math.floor(Math.random()*1000)}`,
        payment_status: 'paid',
        price_paid: 75.0,
        status: 'cancelled_by_admin',
        rebook_eligible: true,
        rebook_used: true,
        rebook_token: usedToken,
        rebook_token_expires_at: usedTokenData.expiresAt,
        rebook_token_used_at: new Date(),
      },
    });
  });

  test.afterAll(async () => {
    if (testUserId) {
      await prisma.booking.deleteMany({ where: { user_id: testUserId } });
      await prisma.user.delete({ where: { id: testUserId } });
    }
    await cleanupTestSession(oldSessionId);
    await cleanupTestSession(newSessionId);
  });

  test('1. Valid rebooking token loads available dates and allows selecting a new date', async ({ page }) => {
    await page.goto(`/rebook?token=${validToken}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toContainText(/Select Your New Training Date/i);
    await expect(page.locator('[role="radiogroup"]')).toBeVisible();

    // Select the first available session radio option
    const sessionCard = page.locator('[role="radio"]').first();
    await sessionCard.click();

    // Verify confirm rebooking button is active
    const confirmBtn = page.getByRole('button', { name: /confirm rebooking/i });
    await expect(confirmBtn).toBeEnabled();
  });

  test('2. Expired rebooking token displays clear expiration error message', async ({ page }) => {
    await page.goto(`/rebook?token=${expiredToken}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toContainText(/Rebooking Error/i);
    await expect(page.locator('main')).toContainText(/expired/i);
    await expect(page.getByRole('button', { name: /back to home/i })).toBeVisible();
  });

  test('3. Re-used rebooking token displays already used error message', async ({ page }) => {
    await page.goto(`/rebook?token=${usedToken}`, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('h1')).toContainText(/Rebooking Error/i);
    await expect(page.locator('main')).toContainText(/already been used/i);
  });
});

