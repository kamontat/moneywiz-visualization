import type { Summarize, TransformBy, TransformByFunc } from './models'

export const bySummarize: TransformByFunc<[], Summarize> = () => {
	const by: TransformBy<Summarize> = (trx) => {
		let totalIncome = 0
		let grossExpenses = 0
		let totalRefunds = 0
		let transactionCount = 0
		let minDate = new Date(8640000000000000)
		let maxDate = new Date(-8640000000000000)

		for (const t of trx) {
			if (t.date < minDate) minDate = t.date
			if (t.date > maxDate) maxDate = t.date

			switch (t.type) {
				case 'Income':
					totalIncome += t.amount.value
					break
				case 'Expense':
					grossExpenses += Math.abs(t.amount.value)
					break
				case 'Refund':
					totalRefunds += t.amount.value
					break
				case 'CategorizedTransfer':
					if (t.amount.value > 0) {
						totalIncome += t.amount.value
					} else {
						grossExpenses += Math.abs(t.amount.value)
					}
					break
			}
			transactionCount++
		}

		const netExpenses = grossExpenses - totalRefunds
		const netCashFlow = totalIncome - netExpenses
		const savingsRate =
			totalIncome === 0 ? 0 : (netCashFlow / totalIncome) * 100

		return {
			totalIncome,
			grossExpenses,
			totalRefunds,
			netExpenses,
			netCashFlow,
			savingsRate,
			transactionCount,
			dateRange: {
				start: transactionCount === 0 ? new Date() : minDate,
				end: transactionCount === 0 ? new Date() : maxDate,
			},
		}
	}
	by.type = 'bySummarize'
	return by
}
