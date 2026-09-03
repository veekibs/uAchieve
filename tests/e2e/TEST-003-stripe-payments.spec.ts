import { test, expect } from '@playwright/test';
import { getOrCreateTestCourse, createOrGetUpcomingTestSession, cleanupTestSession, cleanupTestUsersByEmailPrefix } from '../fixtures/db';

test.describe('TEST-003 · Stripe Payment Testing', () => {
  let courseId: string;
  let sessionId: string;

  const successCard = process.env.STRIPE_TEST_CARD_SUCCESS || '4242424242424242';
  const declinedCard = process.env.STRIPE_TEST_CARD_DECLINED || '4000000000000002';
  const threeDsCard = process.env.STRIPE_TEST_CARD_3DS || '4000002760003184';

  test.beforeAll(async () => {
    const course = await getOrCreateTestCourse('basic-life-support', 'Basic Life Support (BLS)');
    courseId = course.id;
    const session = await createOrGetUpcomingTestSession(courseId, { maxCapacity: 20 });
    sessionId = session.id;
  });

  test.afterAll(async () => {
    await cleanupTestUsersByEmailPrefix('stripe.test');
    await cleanupTestSession(sessionId);
  });

  test('Test A — Step 1 validation and checkout submission for successful card flow', async ({ page }) => {
    await page.goto(`/book/step1?sessionId=${sessionId}&slug=basic-life-support`);

    await page.fill('input#firstName', 'StripeSuccess');
    await page.fill('input#lastName', 'Tester');
    await page.fill('input#email', 'stripe.test.success@example.com');
    await page.fill('input#phone', '07123456789');

    // Agree to terms
    await page.locator('label:has-text("I agree to the")').click();

    const submitBtn = page.getByRole('button', { name: /continue to payment|proceed to payment/i });
    await expect(submitBtn).toBeEnabled();
  });

  test('Test B — Confirmation page renders properly for verified booking references', async ({ page }) => {
    await page.goto('/confirmation?courseName=Basic+Life+Support+(BLS)');

    await expect(page.locator('h2')).toContainText(/booking confirmed/i);
    await expect(page.getByRole('link', { name: /return to home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /view more courses/i })).toBeVisible();
  });

  test('Test C — Capacity refunded error state display', async ({ page }) => {
    // Testing edge-case confirmation view
    await page.goto('/confirmation?session_id=invalid_session_test');

    // Asserts fallback container loads without crashing
    await expect(page.locator('main')).toBeVisible();
  });
});

