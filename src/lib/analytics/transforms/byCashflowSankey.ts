import type { FlowLink, TransformBy } from './models'

export const byCashflowSankey: TransformBy<FlowLink[]> = (trx) => {
	const flowMap = new Map<string, number>()

	const addFlow = (from: string, to: string, value: number) => {
		if (value <= 0) return
		const key = `${from}::${to}`
		flowMap.set(key, (flowMap.get(key) ?? 0) + value)
	}

	for (const t of trx) {
		if (t.type === 'Income' || t.type === 'Windfall' || t.type === 'Sell') {
			const source = t.payee.trim() || 'Unknown Source'
			if ('category' in t) {
				const parent = t.category.category.trim() || 'Uncategorized'
				addFlow(source, `Income:${parent}`, t.amount.value)
			} else {
				addFlow(source, 'Income:Other', t.amount.value)
			}
		}

		if (
			t.type === 'Expense' ||
			t.type === 'Giveaway' ||
			t.type === 'Debt' ||
			t.type === 'Buy'
		) {
			if (!('category' in t)) continue
			const parent = t.category.category.trim() || 'Uncategorized'
			const child = t.category.subcategory.trim() || '(uncategorized)'
			const amount = Math.abs(t.amount.value)
			addFlow('Expense Pool', parent, amount)
			addFlow(parent, `${parent} > ${child}`, amount)
		}
	}

	return Array.from(flowMap.entries())
		.map(([key, flow]) => {
			const [from, to] = key.split('::')
			return { from, to, flow }
		})
		.sort((a, b) => b.flow - a.flow)
}

byCashflowSankey.type = 'byCashflowSankey'
