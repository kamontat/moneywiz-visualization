export type DateFormat = 'DD MMM YYYY' | 'MMM YYYY' | 'YYYY-MM-DD' | 'YYYY-MM'

export const formatDate = (
	date: Date,
	format: DateFormat = 'DD MMM YYYY'
): string => {
	switch (format) {
		case 'DD MMM YYYY':
			return date.toLocaleDateString('en-GB', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
			})
		case 'MMM YYYY':
			return date.toLocaleDateString('en-GB', {
				month: 'short',
				year: 'numeric',
			})
		case 'YYYY-MM-DD': {
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const d = String(date.getDate()).padStart(2, '0')
			return `${y}-${m}-${d}`
		}
		case 'YYYY-MM': {
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			return `${y}-${m}`
		}
	}
}
