import { describe, it, expect } from 'vitest'

import { formatDate } from './date'

describe('date', () => {
	it('should format date in th-TH locale (DD MMM YYYY)', () => {
		// Use a fixed date to ensure consistent output
		// Note: Date construction might be affected by local timezone if not careful with strings
		// Using UTC string timestamp but expecting local formatting might shift the day if timezone offsets apply.
		// However, the code uses `date.toLocaleDateString(DEFAULT_LOCALE, ...)` which uses browser/system local time implied by context or UTC?
		// `date.toLocaleDateString` uses the runtime's local time zone by default unless `timeZone` option is provided.

		// To be robust, I should probably force a specific date where timezone shift won't change the day or mock the timezone.
		// Or I can control the input date to be midday to avoid edge cases.

		const date = new Date(2023, 0, 15, 12, 0, 0) // Jan 15 2023, 12:00 local time

		const result = formatDate(date)
		// Expect '15 ม.ค. 2566'
		expect(result).toBe('15 ม.ค. 2566')
	})
})
