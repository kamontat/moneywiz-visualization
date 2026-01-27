import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('Dashboard - Category Breakdown', () => {
    beforeEach(async () => {
        await page.goto(BASE_URL);
        const fileInput = page.locator('input[type="file"]').first();
        await fileInput.setInputFiles('static/data/report.csv');
        // Wait for dashboard to load by checking for the filename heading
        await expect.element(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();
    });

    test('collapsible panels are visible and interactive', async () => {
        const incomeBtn = page.getByRole('button', { name: /Income by Category/ });
        const expenseBtn = page.getByRole('button', { name: /Expenses by Category/ });

        await expect.element(incomeBtn).toBeVisible();
        await expect.element(expenseBtn).toBeVisible();

        // The panels should be collapsed, meaning the content divs are not in the DOM
        await expect.element(page.locator('#income-breakdown')).not.toBeInTheDocument();
        await expect.element(page.locator('#expense-breakdown')).not.toBeInTheDocument();

        // Expand income
        await incomeBtn.click();
        await expect.element(page.locator('#income-breakdown')).toBeVisible();
        await expect.element(page.locator('#income-breakdown').getByText('Compensation > Salary')).toBeVisible();

        // Expand expense
        await expenseBtn.click();
        await expect.element(page.locator('#expense-breakdown')).toBeVisible();
        await expect.element(page.locator('#expense-breakdown').getByText('Food and Beverage > Food')).toBeVisible();

        // Collapse items again
        await incomeBtn.click();
        await expect.element(page.locator('#income-breakdown')).not.toBeInTheDocument();
    });
});
