<script lang="ts">
	import type { Summarize } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import NetWorthChart from '$components/molecules/NetWorthChart.svelte'
	import QuickSummary from '$components/organisms/QuickSummary.svelte'
	import {
		byCategoryTotal,
		byMonthlyWaterfall,
		toNetWorthSummary,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
			summary?: Summarize
			baselineSummary?: Summarize
		}>

	let {
		transactions,
		summary,
		baselineSummary,
		class: className,
		...rest
	}: Props = $props()

	const waterfall = $derived(transform(transactions, byMonthlyWaterfall))
	const netWorth = $derived(toNetWorthSummary(waterfall))
	const categoryTotals = $derived(transform(transactions, byCategoryTotal))

	const topExpenseDrivers = $derived.by(() => {
		const entries = Object.entries(categoryTotals.Expense?.parents ?? {})
		const total = entries.reduce(
			(sum, [, parent]) => sum + Math.abs(parent.total),
			0
		)

		return entries
			.sort(
				([, left], [, right]) => Math.abs(right.total) - Math.abs(left.total)
			)
			.slice(0, 5)
			.map(([name, parent], index) => {
				const amount = Math.abs(parent.total)
				return {
					rank: index + 1,
					name,
					amount,
					share: total === 0 ? 0 : (amount / total) * 100,
				}
			})
	})

	const formatPercent = (value: number): string => {
		return `${value.toLocaleString('th-TH', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		})}%`
	}
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if transactions.length === 0 || !summary}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions to analyze. Upload a database file to get started.
			</p>
		</Panel>
	{:else}
		<Panel
			title="Financial Snapshot"
			question="Summary cards for income, expenses, net flow, and savings-rate baseline deltas."
		>
			<QuickSummary {summary} {baselineSummary} />
		</Panel>

		<Panel
			title="Net Worth Trend"
			question="Cumulative net worth and monthly change across the selected period."
		>
			<NetWorthChart {netWorth} />
		</Panel>

		<Panel
			title="Top Expense Drivers"
			question="Top expense categories ranked by amount and share."
		>
			{#if topExpenseDrivers.length === 0}
				<p class="py-8 text-center text-sm text-base-content/60">
					No expense category data available.
				</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="d-table d-table-zebra">
						<thead>
							<tr>
								<th class="w-16">Rank</th>
								<th>Category</th>
								<th class="text-right">Amount</th>
								<th class="text-right">Share</th>
							</tr>
						</thead>
						<tbody>
							{#each topExpenseDrivers as driver (driver.name)}
								<tr>
									<td>{driver.rank}</td>
									<td>{driver.name}</td>
									<td class="text-right">{formatCurrency(driver.amount)}</td>
									<td class="text-right">{formatPercent(driver.share)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</Panel>
	{/if}
</div>
