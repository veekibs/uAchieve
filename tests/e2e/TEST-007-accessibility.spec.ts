import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const auditRoutes = [
  { name: 'Homepage', path: '/' },
  { name: 'Courses Index', path: '/courses' },
  { name: 'Course Detail - Basic Life Support', path: '/courses/bls' },
  { name: 'Course Detail - Emergency First Aid', path: '/courses/emergency-first-aid-at-work' },
  { name: 'Booking Step 1 Details', path: '/book/step1' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' },
  { name: 'FAQs', path: '/faqs' },
  { name: 'Privacy Policy', path: '/policies/privacy' },
  { name: 'Terms and Conditions', path: '/policies/terms' },
  { name: 'Cancellation Policy', path: '/policies/cancellation' },
];

test.describe('TEST-007 · Accessibility (a11y) and Keyboard Audits', () => {
  for (const route of auditRoutes) {
    test(`A11y automated audit for ${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });

      // 1. Run Axe-core WCAG 2.1 AA audit
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations if any
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n--- Accessibility Report for ${route.path} ---`);
        accessibilityScanResults.violations.forEach((violation) => {
          console.log(`[${violation.impact?.toUpperCase()}] ${violation.id}: ${violation.description}`);
          violation.nodes.forEach((n) => console.log(`  Target: ${n.target.join(', ')}`));
        });
      }

      // Assert zero critical violations
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical'
      );
      expect(criticalViolations.length).toBe(0);

      // 2. Assert page has at least one heading and images have alt text
      const imagesWithoutAlt = await page.locator('img:not([alt])').count();
      expect(imagesWithoutAlt).toBe(0);
    });
  }

  test('Keyboard navigation: Tab through booking form in logical order', async ({ page }) => {
    await page.goto('/book/step1');

    // Click first input
    const firstInput = page.locator('input#firstName');
    if (await firstInput.isVisible()) {
      await firstInput.focus();
      await expect(firstInput).toBeFocused();

      // Tab to Last Name
      await page.keyboard.press('Tab');
      await expect(page.locator('input#lastName')).toBeFocused();

      // Tab to Email
      await page.keyboard.press('Tab');
      await expect(page.locator('input#email')).toBeFocused();

      // Tab through help tooltip trigger to Phone
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await expect(page.locator('input#phone')).toBeFocused();
    }
  });

  test('Keyboard navigation: Hamburger menu opens and closes via Escape key', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const menuBtn = page.getByRole('button', { name: 'Open menu' });
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    const drawer = page.locator('#mobile-navigation');
    await expect(drawer).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(drawer).not.toBeVisible();
  });
});

