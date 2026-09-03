import { test, expect } from '@playwright/test';
import { getOrCreateTestCourse, createOrGetUpcomingTestSession, cleanupTestSession, cleanupTestUsersByEmailPrefix } from '../fixtures/db';

test.describe('TEST-001 · Booking flow E2E', () => {
  let courseId: string;
  let courseSlug: string;
  let sessionId: string;
  const testEmail = 'e2e.student@uachieve-test.com';

  test.beforeAll(async () => {
    const course = await getOrCreateTestCourse('bls', 'Basic Life Support (BLS)');
    courseId = course.id;
    courseSlug = course.slug;
    const session = await createOrGetUpcomingTestSession(courseId, { maxCapacity: 12 });
    sessionId = session.id;
  });

  test.afterAll(async () => {
    await cleanupTestUsersByEmailPrefix('e2e.student@uachieve-test.com');
    await cleanupTestSession(sessionId);
  });

  test('Full student booking flow from homepage to checkout step 1 with validation', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/UAchieve/i);

    // 2. Click "Browse Courses" or "Book a Course"
    const bookLink = page.getByRole('link', { name: /book a course|browse courses/i }).first();
    await bookLink.click();
    await page.waitForURL(/\/courses/);

    // 3. Select Basic Life Support course
    const blsCourseLink = page.getByRole('link', { name: /Basic Life Support/i }).first();
    await blsCourseLink.click();
    await page.waitForURL(/\/courses\/(bls|basic-life-support)/);

    // 4. Pick an available session date or click "Book This Date"
    const bookDateButton = page.getByRole('link', { name: /book this date|book session/i }).first();
    if (await bookDateButton.isVisible()) {
      await bookDateButton.click();
    } else {
      // Direct navigation fallback to step 1 with seeded session
      await page.goto(`/book/step1?sessionId=${sessionId}&slug=${courseSlug}`);
    }

    await page.waitForURL(/\/book\/step1/);

    // 5. Fill in booking details
    await page.fill('input#firstName', 'Alex');
    await page.fill('input#lastName', 'Morgan');
    await page.fill('input#email', testEmail);
    await page.fill('input#phone', '07123456789');
    await page.fill('input#companyName', 'Acme Corp');

    // Select course type
    const firstTimeRadio = page.locator('input[name="courseType"][value="first-time"]');
    if (await firstTimeRadio.count() > 0) {
      await page.locator('label:has(input[name="courseType"][value="first-time"])').click();
    }

    // Consent checkboxes
    const smsConsentLabel = page.locator('label:has-text("I consent to receive SMS")');
    if (await smsConsentLabel.isVisible()) {
      await smsConsentLabel.click();
    }

    const termsLabel = page.locator('label:has-text("I agree to the")');
    await termsLabel.click();

    // 6. Assert submit button is active
    const submitBtn = page.getByRole('button', { name: /continue to payment|proceed to payment/i });
    await expect(submitBtn).toBeEnabled();

    // Verify zero fatal page errors
    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('CookieYes'));
    expect(fatalErrors.length).toBe(0);
  });
});

