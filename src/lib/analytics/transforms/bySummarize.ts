import type { TransformBy, TransformByFunc } from './models'

export interface SummarizeDateRange {
	start: Date
	end: Date
}

export interface Summarize {
	totalIncome: number
	totalExpenses: number
	netTotal: number
	transactionCount: number
	savingRate: number
	dateRange: SummarizeDateRange
}

export const bySummarize: TransformByFunc<[], Summarize> = () => {
	const by: TransformBy<Summarize> = (trx) => {
		let totalIncome = 0
		let totalExpenses = 0
		let transactionCount = 0
		let minDate = new Date(8640000000000000)
		let maxDate = new Date(-8640000000000000)

		for (const t of trx) {
			if (t.date < minDate) minDate = t.date
			if (t.date > maxDate) maxDate = t.date

			if (t.type === 'Income') {
				totalIncome += t.amount.value
			} else if (t.type === 'Expense') {
				totalExpenses += t.amount.value
			}
			transactionCount++
		}

		const netTotal = totalIncome + totalExpenses
		const savingRate = totalIncome === 0 ? 0 : (netTotal / totalIncome) * 100

		return {
			totalIncome,
			totalExpenses,
			netTotal,
			transactionCount,
			savingRate,
			dateRange: {
				start: transactionCount === 0 ? new Date() : minDate,
				end: transactionCount === 0 ? new Date() : maxDate,
			},
		}
	}
	by.type = 'bySummarize'
	return by
}
