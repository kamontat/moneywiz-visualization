export type DateFormat = 'DD MMM YYYY' | 'MMM YYYY' | 'YYYY-MM-DD' | 'YYYY-MM'

/**
 * format date to DD MMM YYYY
 * @param date input date
 * @returns formatted date string
 */
export const formatDate = (
	date: Date,
	format: DateFormat = 'DD MMM YYYY'
): string => {
	switch (format) {
		case 'DD MMM YYYY':
			return formatDateDDMMMYYYY(date)
		case 'MMM YYYY':
			return formatDateMMMYYYY(date)
		case 'YYYY-MM-DD':
			return formatDateYYYYMMDD(date)
		case 'YYYY-MM':
			return formatDateYYYYMM(date)
	}
}

const formatDateDDMMMYYYY = (date: Date): string => {
	return date.toLocaleDateString('en-GB', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	})
}

const formatDateMMMYYYY = (date: Date): string => {
	return date.toLocaleDateString('en-GB', {
		month: 'short',
		year: 'numeric',
	})
}

const formatDateYYYYMMDD = (date: Date): string => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toFixed(0).padStart(2, '0')
	const day = date.getDate().toFixed(0).padStart(2, '0')
	return `${year}-${month}-${day}`
}

const formatDateYYYYMM = (date: Date): string => {
	const year = date.getFullYear()
	const month = (date.getMonth() + 1).toFixed(0).padStart(2, '0')
	return `${year}-${month}`
}
