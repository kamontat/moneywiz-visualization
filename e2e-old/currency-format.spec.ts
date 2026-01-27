import { describe, test, expect, beforeEach } from 'vitest';
import { page } from '@vitest/browser/context';

const BASE_URL = 'http://localhost:4173';

describe('Dashboard - Currency Formatting', () => {
  beforeEach(async () => {
    await page.goto(BASE_URL);
    // Upload CSV
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles('static/data/report.csv');
    // Wait for dashboard to load by checking for Saving Rate label which is unique
    await expect.element(page.getByText('Saving Rate', { exact: true })).toBeVisible();
  });

  test('displays financial amounts with currency symbols', async () => {
    // Check Summary Cards
    // The structure is: div[role="listitem"] > p (label) + p (value)

    const summaryList = page.getByRole('list').first();

    // Check Income Value
    // We select the list item that has text "Income"
    const incomeCard = summaryList.locator('div[role="listitem"]').filter({ hasText: 'Income' });
    const incomeValue = incomeCard.locator('p.text-lg');

    await expect.element(incomeValue).toBeVisible();
    const incomeText = await incomeValue.textContent();
    // Verify it starts with ฿ and contains numbers
    expect(incomeText).toMatch(/^฿[\d,]+\.\d{2}$/);

    // Check Expenses Value
    const expensesCard = summaryList.locator('div[role="listitem"]').filter({ hasText: 'Expenses' });
    const expensesValue = expensesCard.locator('p.text-lg');
    await expect.element(expensesValue).toBeVisible();
    const expensesText = await expensesValue.textContent();
    expect(expensesText).toMatch(/^฿[\d,]+\.\d{2}$/);

    // Check Net Value
    const netCard = summaryList.locator('div[role="listitem"]').filter({ hasText: 'Net / Cash Flow' });
    const netValue = netCard.locator('p.text-lg');
    await expect.element(netValue).toBeVisible();
    const netText = await netValue.textContent();
    // Net could be negative or positive, but handled by formatTHB
    // If negative, it might be "-฿..." or "฿-..." depending on locale implementation in Node vs Browser?
    // In Thai locale, it's usually -฿100.00 or ฿-100.00.
    // Let's simply check it contains ฿
    expect(netText).toContain('฿');
  });

  test('uses symbols in Category Breakdown', async () => {
     // Income Breakdown Total
     const incomeButton = page.getByRole('button', { name: /Income by Category/ });
     await expect.element(incomeButton).toBeVisible();
     // The button contains the total text
     const incomeButtonText = await incomeButton.textContent();
     expect(incomeButtonText).toContain('฿');

     // Expand and check items
     await incomeButton.click();
     const incomeList = page.locator('#income-breakdown');
     await expect.element(incomeList).toBeVisible();

     // Check list items
     const firstItemAmount = incomeList.locator('li').first().locator('span.font-medium');
     await expect.element(firstItemAmount).toBeVisible();
     expect(await firstItemAmount.textContent()).toContain('฿');
  });
});
