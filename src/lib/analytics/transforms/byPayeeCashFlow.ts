import type { PayeeCashFlowEntry, TransformBy } from './models'

const UNKNOWN_PAYEE = 'Unknown Payee'

const normalizePayee = (payee: string): string => {
	const trimmed = payee.trim()
	return trimmed ? trimmed : UNKNOWN_PAYEE
}

export const byPayeeCashFlow: TransformBy<PayeeCashFlowEntry[]> = (trx) => {
	const map = new Map<
		string,
		{ debt: number; debtRepayment: number; windfall: number; giveaway: number }
	>()

	for (const t of trx) {
		if (
			t.type !== 'Debt' &&
			t.type !== 'DebtRepayment' &&
			t.type !== 'Windfall' &&
			t.type !== 'Giveaway'
		) {
			continue
		}

		const payee = normalizePayee(t.payee)
		if (!map.has(payee)) {
			map.set(payee, { debt: 0, debtRepayment: 0, windfall: 0, giveaway: 0 })
		}

		const entry = map.get(payee)
		if (!entry) continue

		switch (t.type) {
			case 'Debt':
				entry.debt += Math.abs(t.amount.value)
				break
			case 'DebtRepayment':
				entry.debtRepayment += Math.abs(t.amount.value)
				break
			case 'Windfall':
				entry.windfall += t.amount.value
				break
			case 'Giveaway':
				entry.giveaway += Math.abs(t.amount.value)
				break
		}
	}

	return Array.from(map.entries())
		.map(([payee, totals]) => ({ payee, ...totals }))
		.sort((a, b) => {
			const aTotal = a.debt + a.debtRepayment + a.windfall + a.giveaway
			const bTotal = b.debt + b.debtRepayment + b.windfall + b.giveaway
			return bTotal - aTotal
		})
}

byPayeeCashFlow.type = 'byPayeeCashFlow'
