import { describe, test } from 'vitest';
import { expect } from '@playwright/test';
import { setupBrowser, getPage, BASE_URL } from './fixtures';

describe('Home Page', () => {
	setupBrowser();

	test('home page has header', async () => {
		const page = getPage();
		await page.goto(BASE_URL);
		await expect(page.locator('header').getByText('MoneyWiz Report')).toBeVisible();
	});
});
