import type { Summarize, TransformBy, TransformByFunc } from './models'

export const bySummarize: TransformByFunc<[], Summarize> = () => {
	const by: TransformBy<Summarize> = (trx) => {
		let totalIncome = 0
		let grossExpenses = 0
		let totalRefunds = 0
		let totalDebt = 0
		let totalDebtRepayment = 0
		let totalWindfall = 0
		let totalGiveaway = 0
		let totalBuy = 0
		let totalSell = 0
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
				case 'Debt':
					totalDebt += Math.abs(t.amount.value)
					break
				case 'DebtRepayment':
					totalDebtRepayment += Math.abs(t.amount.value)
					break
				case 'Windfall':
					totalWindfall += t.amount.value
					totalIncome += t.amount.value
					break
				case 'Giveaway':
					totalGiveaway += Math.abs(t.amount.value)
					grossExpenses += Math.abs(t.amount.value)
					break
				case 'Buy':
					totalBuy += Math.abs(t.amount.value)
					break
				case 'Sell':
					totalSell += t.amount.value
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
			totalDebt,
			totalDebtRepayment,
			totalWindfall,
			totalGiveaway,
			totalBuy,
			totalSell,
		}
	}
	by.type = 'bySummarize'
	return by
}
