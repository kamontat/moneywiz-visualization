/**
 * Financial parsing and formatting utilities
 */

/**
 * Parse a THB amount string (with thousands separators) to a number
 */
export function parseAmountTHB(value: string): number {
	// Remove thousands separators and spaces
	const cleaned = value.replace(/[,\s]/g, '');
	const num = Number(cleaned);
	return isNaN(num) ? 0 : num;
}

/**
 * Parse a date string in DD/MM/YYYY format
 */
export function parseDateDDMMYYYY(value: string): Date | null {
	const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (!m) return null;
	const [_, dd, mm, yyyy] = m;
	// Construct date at local midnight
	return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

/**
 * Format a number as THB currency
 */
export function formatTHB(n: number): string {
	return new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'THB',
		maximumFractionDigits: 2
	}).format(n);
}
