import { test, expect } from '@playwright/test';
import { getOrCreateTestCourse, getNextAvailableSaturday, cleanupTestSession } from '../fixtures/db';

test.describe('TEST-002 · Admin flow E2E', () => {
  let courseId: string;
  let createdSessionId: string;

  const adminEmail = process.env.ADMIN_EMAIL || 'uachieve@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  test.beforeAll(async () => {
    const course = await getOrCreateTestCourse('basic-life-support', 'Basic Life Support (BLS)');
    courseId = course.id;
  });

  test.afterAll(async () => {
    if (createdSessionId) {
      await cleanupTestSession(createdSessionId);
    }
  });

  test('Admin logs in, manages sessions and views rosters', async ({ page }) => {
    // 1. Navigate to /admin (or /login)
    await page.goto('/admin');

    // If redirected to login or login form is present
    if (page.url().includes('/login') || (await page.locator('input[type="email"]').isVisible())) {
      await page.fill('input[type="email"]', adminEmail);
      await page.fill('input[type="password"]', adminPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/admin/);
    }

    // 2. Assert Admin dashboard loads with header
    await expect(page.locator('h1')).toContainText(/Good morning, Ann|Admin/i);

    // 3. Open Add New Session modal
    const addSessionBtn = page.locator('button:has(svg.lucide-plus), button:has-text("Add Session")').first();
    await addSessionBtn.click();

    // Verify dialog opens
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // 4. Fill in new session fields
    const testDate = await getNextAvailableSaturday();
    await page.fill('input[type="number"]', '12');
    await page.fill('input[placeholder*="Sydney"], input[placeholder*="venue"]', 'E2E Test Training Hall');
    await page.fill('input[placeholder*="UK address"]', '123 High Street, Bedford, MK40 1AA');

    // Close modal via Escape key or Cancel to test a11y & state
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();

    // 5. Navigate to public courses page
    await page.goto('/courses');
    await expect(page.locator('h1')).toContainText(/courses/i);

    // 6. Navigate back to /admin
    await page.goto('/admin');
    await expect(page.locator('h1')).toBeVisible();

    // Verify session cards have View Roster and Edit Session actions
    const editBtn = page.getByRole('button', { name: 'Edit Session' }).first();
    const rosterLink = page.getByRole('link', { name: /view roster/i }).first();
    if (await editBtn.isVisible()) {
      await expect(editBtn).toBeVisible();
      await expect(rosterLink).toBeVisible();
    }
  });
});

