import type {
	TopPayeeEntry,
	TopPayeesCategoryGroup,
	TopPayeesPerCategoryResult,
	TransformBy,
	TransformByFunc,
} from './models'
import type { ParsedTransactionType } from '$lib/transactions/models'

const UNKNOWN_PAYEE = 'Unknown Payee'

const normalizePayee = (payee: string): string => {
	const trimmed = payee.trim()
	return trimmed ? trimmed : UNKNOWN_PAYEE
}

const normalizeCategory = (category: string, subcategory: string): string => {
	const parent = category.trim()
	const child = subcategory.trim()
	if (parent && child) return `${parent} › ${child}`
	if (parent) return parent
	if (child) return child
	return 'Uncategorized'
}

export const byTopPayeesPerCategory: TransformByFunc<
	[ParsedTransactionType, number?],
	TopPayeesPerCategoryResult
> = (transactionType, topN = 5) => {
	const by: TransformBy<TopPayeesPerCategoryResult> = (trx) => {
		const categoryPayeeMap = new Map<
			string,
			Map<string, { amount: number; transactionCount: number }>
		>()
		const categoryTotalMap = new Map<string, number>()

		for (const t of trx) {
			if (t.type !== transactionType) continue
			if (!('category' in t) || !('payee' in t)) continue

			const category = normalizeCategory(
				t.category.category,
				t.category.subcategory
			)
			const payee = normalizePayee(t.payee)
			const amount = Math.abs(t.amount.value)

			if (!categoryPayeeMap.has(category)) {
				categoryPayeeMap.set(category, new Map())
			}
			const payeeMap = categoryPayeeMap.get(category)!
			const existing = payeeMap.get(payee) ?? { amount: 0, transactionCount: 0 }
			existing.amount += amount
			existing.transactionCount += 1
			payeeMap.set(payee, existing)

			categoryTotalMap.set(
				category,
				(categoryTotalMap.get(category) ?? 0) + amount
			)
		}

		const groups: TopPayeesCategoryGroup[] = Array.from(
			categoryPayeeMap.entries()
		)
			.map(([category, payeeMap]) => {
				const totalAmount = categoryTotalMap.get(category) ?? 0

				const topPayees: TopPayeeEntry[] = Array.from(payeeMap.entries())
					.map(([payee, data]) => ({
						payee,
						amount: data.amount,
						transactionCount: data.transactionCount,
						share: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
					}))
					.sort((a, b) => b.amount - a.amount)
					.slice(0, topN)

				return {
					category,
					type: transactionType,
					totalAmount,
					topPayees,
				}
			})
			.sort((a, b) => b.totalAmount - a.totalAmount)

		return {
			groups,
			topN,
			transactionType,
		}
	}

	by.type = 'byTopPayeesPerCategory'
	return by
}
