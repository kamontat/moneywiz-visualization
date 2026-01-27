import { test, expect } from '@playwright/test';

test.describe('Header Icons', () => {
    test.beforeEach(async ({ page }) => {
			await page.goto('/');
		});

    test('upload button has visible icon', async ({ page }) => {
			// The default text is "Upload CSV"
			const uploadBtn = page.getByRole('button', { name: /Upload CSV/ });
			await expect(uploadBtn).toBeVisible();

			// Check for SVG inside button
			const icon = uploadBtn.locator('svg');
			await expect(icon).toBeVisible();
			await expect(icon).toHaveAttribute('aria-hidden', 'true');
		});

    test('clear button has visible icon when loaded', async ({ page }) => {
			// Upload a file to make Clear button appear
			const fileInput = page.locator('input[type="file"]').first();
			// Assuming test data exists at static/data/report.csv as per other tests
			await fileInput.setInputFiles('static/data/report.csv');

			const clearBtn = page.getByRole('button', { name: 'Clear loaded CSV' });
			await expect(clearBtn).toBeVisible();

			const icon = clearBtn.locator('svg');
			await expect(icon).toBeVisible();
			await expect(icon).toHaveAttribute('aria-hidden', 'true');
		});
});
