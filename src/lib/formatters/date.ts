import { DEFAULT_LOCALE } from './constants'

/**
 * format date to DD MMM YYYY
 * @param date input date
 * @returns formatted date string
 */
export const formatDate = (date: Date): string => {
	return date.toLocaleDateString(DEFAULT_LOCALE, {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}
