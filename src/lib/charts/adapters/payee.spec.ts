import type {
	PayeeSpendSeries,
	PayeeSpendTotal,
} from '$lib/analytics/transforms/models'
import { describe, expect, it } from 'vitest'

import { toPayeeSpendBarData, toPayeeSpendTrendData } from './payee'

describe('payee chart adapters', () => {
	it('maps payee ranking into horizontal bar data', () => {
		const topPayees: PayeeSpendTotal[] = [
			{
				payee: 'Coffee Shop',
				netSpend: 120,
				transactionCount: 4,
				avgTicket: 30,
			},
			{
				payee: 'Supermarket',
				netSpend: 90,
				transactionCount: 3,
				avgTicket: 30,
			},
		]

		const result = toPayeeSpendBarData(topPayees)

		expect(result.labels).toEqual(['Coffee Shop', 'Supermarket'])
		expect(result.datasets[0]?.label).toBe('Net Spend')
		expect(result.datasets[0]?.data).toEqual([120, 90])
	})

	it('maps payee series into trend line data', () => {
		const series: PayeeSpendSeries = {
			mode: 'Daily',
			points: [
				{
					date: new Date('2026-01-01T00:00:00.000Z'),
					label: '01 Jan 2026',
					netSpend: 40,
					transactionCount: 2,
				},
				{
					date: new Date('2026-01-02T00:00:00.000Z'),
					label: '02 Jan 2026',
					netSpend: 60,
					transactionCount: 3,
				},
			],
		}

		const result = toPayeeSpendTrendData(series)

		expect(result.labels).toEqual(['01 Jan 2026', '02 Jan 2026'])
		expect(result.datasets[0]?.label).toBe('Net Spend')
		expect(result.datasets[0]?.data).toEqual([40, 60])
	})
})
