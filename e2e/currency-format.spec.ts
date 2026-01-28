import { test, expect } from '@playwright/test';
import { generateCsv } from './utils/csv-generator';

test.describe('Dashboard - Currency Formatting', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Upload CSV' })).toBeVisible();
		// Upload CSV
		const fileInput = page.locator('input[type="file"]').first();

		const csvContent = generateCsv([
			{ Category: 'Income', Amount: '1000.00', Description: 'Income' },
			{ Category: 'Expense', Amount: '-500.00', Description: 'Expense' },
		]);

		await fileInput.setInputFiles({
			name: 'report.csv',
			mimeType: 'text/csv',
			buffer: Buffer.from(csvContent),
		});

		// Wait for dashboard to load by checking for Saving Rate label which is unique
		await expect(page.getByRole('heading', { name: 'report.csv' })).toBeVisible();
		await expect(page.getByText('Saving Rate', { exact: true })).toBeVisible();
	});

	test('displays financial amounts with currency symbols', async ({ page }) => {
		// Check Summary Cards
		// The structure is: div[role="listitem"] > p (label) + p (value)

		const summaryList = page.getByRole('list').first();

		// Check Income Value
		// We select the list item that has text "Income"
		const incomeCard = summaryList.locator('div[role="listitem"]').filter({ hasText: 'Income' });
		const incomeValue = incomeCard.locator('p.text-lg');

		await expect(incomeValue).toBeVisible();
		const incomeText = await incomeValue.textContent();
		// Verify it starts with ฿ and contains numbers
		expect(incomeText).toMatch(/^฿[\d,]+\.\d{2}$/);

		// Check Expenses Value
		const expensesCard = summaryList
			.locator('div[role="listitem"]')
			.filter({ hasText: 'Expenses' });
		const expensesValue = expensesCard.locator('p.text-lg');
		await expect(expensesValue).toBeVisible();
		const expensesText = await expensesValue.textContent();
		expect(expensesText).toMatch(/^฿[\d,]+\.\d{2}$/);

		// Check Net Value
		const netCard = summaryList
			.locator('div[role="listitem"]')
			.filter({ hasText: 'Net / Cash Flow' });
		const netValue = netCard.locator('p.text-lg');
		await expect(netValue).toBeVisible();
		const netText = await netValue.textContent();
		// Net could be negative or positive, but handled by formatTHB
		// If negative, it might be "-฿..." or "฿-..." depending on locale implementation in Node vs Browser?
		// In Thai locale, it's usually -฿100.00 or ฿-100.00.
		// Let's simply check it contains ฿
		expect(netText).toContain('฿');
	});

	test('uses symbols in Category Breakdown', async ({ page }) => {
		// Income Breakdown Total
		const incomeButton = page.getByRole('button', { name: /Income by Category/ });
		await expect(incomeButton).toBeVisible();
		// The button contains the total text
		const incomeButtonText = await incomeButton.textContent();
		expect(incomeButtonText).toContain('฿');

		// Expand and check items
		await incomeButton.click();
		const incomeList = page.locator('#income-breakdown');
		await expect(incomeList).toBeVisible();

		// Check list items
		const firstItemAmount = incomeList.locator('li').first().locator('span.font-medium');
		await expect(firstItemAmount).toBeVisible();
		expect(await firstItemAmount.textContent()).toContain('฿');
	});
});
