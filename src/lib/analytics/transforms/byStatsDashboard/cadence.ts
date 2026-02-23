import type { StatsCadence, StatsRange } from '$lib/analytics/transforms/models'
import type { ParsedTransaction } from '$lib/transactions/models'
import { formatDate } from '$lib/formatters/date'

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const buildCadence = (
	transactions: ParsedTransaction[],
	currentRange: StatsRange
): StatsCadence => {
	const activeDays = new Set<string>()
	const weekdayTotals = new Array<number>(7).fill(0)
	let spendTotal = 0
	let categorizedCount = 0
	let uncategorizedCount = 0
	let payeeCount = 0
	let unknownPayeeCount = 0

	for (const transaction of transactions) {
		activeDays.add(formatDate(transaction.date, 'YYYY-MM-DD'))

		if (
			transaction.type === 'Expense' ||
			transaction.type === 'Giveaway' ||
			transaction.type === 'Debt' ||
			transaction.type === 'Buy'
		) {
			const spend = Math.abs(transaction.amount.value)
			weekdayTotals[transaction.date.getDay()] += spend
			spendTotal += spend
		}

		if ('category' in transaction) {
			categorizedCount += 1
			const category = transaction.category.category.trim()
			const subcategory = transaction.category.subcategory.trim()
			if (!category && !subcategory) {
				uncategorizedCount += 1
			}
		}

		if ('payee' in transaction) {
			payeeCount += 1
			if (!transaction.payee.trim()) {
				unknownPayeeCount += 1
			}
		}
	}

	const weekdaySpend = weekdayTotals.map((amount, index) => ({
		weekday: weekdayLabels[index],
		amount,
		share: spendTotal === 0 ? 0 : (amount / spendTotal) * 100,
	}))

	return {
		activeDays: activeDays.size,
		noSpendDays: Math.max(0, currentRange.days - activeDays.size),
		avgTransactionsPerActiveDay:
			activeDays.size === 0 ? 0 : transactions.length / activeDays.size,
		weekdaySpend,
		uncategorizedRate:
			categorizedCount === 0
				? 0
				: (uncategorizedCount / categorizedCount) * 100,
		unknownPayeeRate:
			payeeCount === 0 ? 0 : (unknownPayeeCount / payeeCount) * 100,
	}
}
