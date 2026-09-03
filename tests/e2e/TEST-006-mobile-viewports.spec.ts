import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'iPhone SE (320x568)', width: 320, height: 568 },
  { name: 'iPhone 8 (375x667)', width: 375, height: 667 },
  { name: 'iPhone 14 (390x844)', width: 390, height: 844 },
  { name: 'iPad (768x1024)', width: 768, height: 1024 },
];

for (const vp of viewports) {
  test.describe(`TEST-006 · Mobile Testing - ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`1. Homepage layout & navigation in ${vp.name}`, async ({ page }) => {
      await page.goto('/');

      // Assert hero text is visible and not clipped
      const heroHeading = page.locator('h1').first();
      await expect(heroHeading).toBeVisible();

      // Assert mobile Book button or CTA is visible
      const bookBtn = page.getByRole('button', { name: /book a course/i }).first();
      await expect(bookBtn).toBeVisible();

      if (vp.width < 768) {
        // Test Hamburger menu
        const hamburgerBtn = page.getByRole('button', { name: 'Open menu' });
        await expect(hamburgerBtn).toBeVisible();
        await hamburgerBtn.click();

        // Nav links in drawer
        const drawer = page.locator('#mobile-navigation');
        await expect(drawer).toBeVisible();

        const coursesLink = drawer.getByRole('link', { name: 'Courses' });
        await expect(coursesLink).toBeVisible();

        // Close hamburger
        const closeBtn = drawer.getByRole('button', { name: 'Close menu' }).first();
        await closeBtn.click();
        await expect(drawer).not.toBeVisible();
      }
    });

    test(`2. Booking form elements fit without horizontal scroll in ${vp.name}`, async ({ page }) => {
      await page.goto('/book/step1');

      // Assert no horizontal body overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Verify input elements are full width within mobile bounds
      const firstNameInput = page.locator('input#firstName');
      if (await firstNameInput.isVisible()) {
        const boundingBox = await firstNameInput.boundingBox();
        const threshold = vp.width >= 768 ? vp.width * 0.35 : vp.width * 0.7;
        expect(boundingBox?.width).toBeGreaterThan(threshold);
      }
    });

    test(`3. Confirmation page renders cleanly in ${vp.name}`, async ({ page }) => {
      await page.goto('/confirmation?courseName=Emergency+First+Aid+at+Work');

      await expect(page.locator('h2')).toContainText(/booking confirmed/i);

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  });
}

