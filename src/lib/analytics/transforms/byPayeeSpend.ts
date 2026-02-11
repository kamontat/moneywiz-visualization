import type {
	PayeeSpendAnalysis,
	PayeeSpendPoint,
	PayeeSpendSeries,
	PayeeSpendTotal,
	TransformBy,
	TransformByFunc,
} from './models'
import { formatDate } from '$lib/formatters/date'

const UNKNOWN_PAYEE = 'Unknown Payee'

type PayeeEvent = {
	date: Date
	netSpend: number
}

const normalizePayee = (payee: string): string => {
	const trimmed = payee.trim()
	return trimmed ? trimmed : UNKNOWN_PAYEE
}

const getMode = (transactionCount: number): PayeeSpendSeries['mode'] => {
	if (transactionCount < 50) return 'Daily'
	return 'Monthly'
}

const getBucketKey = (mode: PayeeSpendSeries['mode'], date: Date): string => {
	if (mode === 'Daily') return formatDate(date, 'YYYY-MM-DD')
	return formatDate(date, 'YYYY-MM')
}

const parseBucketDate = (mode: PayeeSpendSeries['mode'], key: string): Date => {
	if (mode === 'Daily') return new Date(`${key}T00:00:00`)
	return new Date(`${key}-01T00:00:00`)
}

const toPointLabel = (mode: PayeeSpendSeries['mode'], date: Date): string => {
	if (mode === 'Daily') return formatDate(date)
	return formatDate(date, 'MMM YYYY')
}

const comparePayeeTotals = (
	left: PayeeSpendTotal,
	right: PayeeSpendTotal
): number => {
	if (left.netSpend !== right.netSpend) {
		return right.netSpend - left.netSpend
	}

	if (left.transactionCount !== right.transactionCount) {
		return right.transactionCount - left.transactionCount
	}

	return left.payee.localeCompare(right.payee)
}

const resolveContribution = (event: {
	type: 'Expense' | 'Giveaway' | 'Refund'
	amount: { value: number }
}): number => {
	switch (event.type) {
		case 'Expense':
		case 'Giveaway':
			return Math.abs(event.amount.value)
		case 'Refund':
			return -event.amount.value
	}
}

export const byPayeeSpend: TransformByFunc<[number?], PayeeSpendAnalysis> = (
	limit = 8
) => {
	const by: TransformBy<PayeeSpendAnalysis> = (trx) => {
		const payeeTotals = new Map<
			string,
			{ netSpend: number; transactionCount: number }
		>()
		const payeeEvents = new Map<string, PayeeEvent[]>()

		for (const t of trx) {
			if (
				t.type !== 'Expense' &&
				t.type !== 'Giveaway' &&
				t.type !== 'Refund'
			) {
				continue
			}

			const payee = normalizePayee(t.payee)
			const contribution = resolveContribution(t)

			const total = payeeTotals.get(payee) ?? {
				netSpend: 0,
				transactionCount: 0,
			}
			total.netSpend += contribution
			total.transactionCount += 1
			payeeTotals.set(payee, total)

			const events = payeeEvents.get(payee) ?? []
			events.push({
				date: t.date,
				netSpend: contribution,
			})
			payeeEvents.set(payee, events)
		}

		const positivePayees = Array.from(payeeTotals.entries())
			.map(([payee, total]) => {
				const avgTicket =
					total.transactionCount === 0
						? 0
						: total.netSpend / total.transactionCount

				return {
					payee,
					netSpend: total.netSpend,
					transactionCount: total.transactionCount,
					avgTicket,
				} satisfies PayeeSpendTotal
			})
			.filter((entry) => entry.netSpend > 0)
			.sort(comparePayeeTotals)

		const seriesByPayee: Record<string, PayeeSpendSeries> = {}

		for (const payee of positivePayees) {
			const events = payeeEvents.get(payee.payee) ?? []
			const mode = getMode(events.length)
			const pointMap = new Map<
				string,
				{ date: Date; netSpend: number; transactionCount: number }
			>()

			for (const event of events) {
				const key = getBucketKey(mode, event.date)
				const current = pointMap.get(key) ?? {
					date: parseBucketDate(mode, key),
					netSpend: 0,
					transactionCount: 0,
				}
				current.netSpend += event.netSpend
				current.transactionCount += 1
				pointMap.set(key, current)
			}

			const points: PayeeSpendPoint[] = Array.from(pointMap.entries())
				.sort(([left], [right]) => left.localeCompare(right))
				.map(([, point]) => ({
					date: point.date,
					label: toPointLabel(mode, point.date),
					netSpend: point.netSpend,
					transactionCount: point.transactionCount,
				}))

			seriesByPayee[payee.payee] = {
				mode,
				points,
			}
		}

		return {
			topPayees: positivePayees.slice(0, limit),
			seriesByPayee,
			uniquePayeeCount: positivePayees.length,
			totalNetSpend: positivePayees.reduce(
				(sum, payee) => sum + payee.netSpend,
				0
			),
		}
	}

	by.type = 'byPayeeSpend'
	return by
}
