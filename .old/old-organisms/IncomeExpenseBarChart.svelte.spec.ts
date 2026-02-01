import { describe, it, expect, vi } from 'vitest'
import { page } from 'vitest/browser'

import IncomeExpenseBarChart from './IncomeExpenseBarChart.svelte'

// Mock Chart.js
vi.mock('chart.js/auto', () => {
	return {
		default: class {
			destroy = vi.fn()
			constructor() {}
		},
	}
})

describe('IncomeExpenseBarChart', () => {
	it('initializes without crashing', () => {
		const data = {
			labels: ['Jan', 'Feb'],
			income: [100, 200],
			expenses: [50, 60],
			net: [50, 140],
			mode: 'monthly' as const,
		}

		const { container } = page.render(IncomeExpenseBarChart, { props: { data } })
		const canvas = container.querySelector('canvas')
		expect(canvas).toBeTruthy()
	})
})
