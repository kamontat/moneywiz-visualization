import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('Header Icons', () => {
    beforeEach(async () => {
        await page.goto(BASE_URL);
    });

    test('upload button has visible icon', async () => {
        // The default text is "Upload CSV"
        const uploadBtn = page.getByRole('button', { name: /Upload CSV/ });
        await expect.element(uploadBtn).toBeVisible();

        // Check for SVG inside button
        const icon = uploadBtn.locator('svg');
        await expect.element(icon).toBeVisible();
        await expect.element(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('clear button has visible icon when loaded', async () => {
        // Upload a file to make Clear button appear
        const fileInput = page.locator('input[type="file"]').first();
        // Assuming test data exists at static/data/report.csv as per other tests
        await fileInput.setInputFiles('static/data/report.csv');

        const clearBtn = page.getByRole('button', { name: 'Clear loaded CSV' });
        await expect.element(clearBtn).toBeVisible();

        const icon = clearBtn.locator('svg');
        await expect.element(icon).toBeVisible();
        await expect.element(icon).toHaveAttribute('aria-hidden', 'true');
    });
});
