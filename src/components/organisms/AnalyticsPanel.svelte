<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import AnalyticsStats from '$components/molecules/AnalyticsStats.svelte'
	import ExperimentMonthlyWaterfall from '$components/molecules/ExperimentMonthlyWaterfall.svelte'
	import IncomeExpenseComparisonChart from '$components/molecules/IncomeExpenseComparisonChart.svelte'
	import NetWorthChart from '$components/molecules/NetWorthChart.svelte'
	import PayeeSpendInsightsChart from '$components/molecules/PayeeSpendInsightsChart.svelte'
	import {
		byPayeeSpend,
		byMonthlyWaterfall,
		bySummarize,
		byTimeSeries,
		toNetWorthSummary,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	let { transactions, class: className, ...rest }: Props = $props()

	const summary = $derived(transform(transactions, bySummarize()))
	const waterfall = $derived(transform(transactions, byMonthlyWaterfall))
	const netWorth = $derived(toNetWorthSummary(waterfall))
	const timeSeries = $derived(
		transform(
			transactions,
			byTimeSeries(summary.dateRange.start, summary.dateRange.end)
		)
	)
	const payeeSpend = $derived(transform(transactions, byPayeeSpend(20)))
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if transactions.length === 0}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions to analyze. Upload a database file to get started.
			</p>
		</Panel>
	{:else}
		<AnalyticsStats {summary} />

		<Panel title="Monthly Waterfall">
			<p class="mb-3 text-sm text-base-content/70">
				Breaks monthly deltas into income, spending, debt, and buy/sell impact.
			</p>
			<ExperimentMonthlyWaterfall steps={waterfall} />
		</Panel>

		<Panel title="Net Worth">
			<p class="mb-3 text-sm text-base-content/70">
				Tracks cumulative balance from the period start using monthly net
				changes.
			</p>
			<NetWorthChart {netWorth} />
		</Panel>

		<Panel title="Income vs Expenses">
			<IncomeExpenseComparisonChart {timeSeries} />
		</Panel>

		<Panel title="Payee Spend Insights">
			<p class="mb-3 text-sm text-base-content/70">
				Ranks payees by net spend (expenses + giveaway - refunds). Click a payee
				to inspect trend.
			</p>
			<PayeeSpendInsightsChart analysis={payeeSpend} />
		</Panel>
	{/if}
</div>
