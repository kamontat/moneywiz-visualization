<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import AnalyticsStats from '$components/molecules/AnalyticsStats.svelte'
	import CashFlowTrendChart from '$components/molecules/CashFlowTrendChart.svelte'
	import ExpenseBreakdownChart from '$components/molecules/ExpenseBreakdownChart.svelte'
	import IncomeBreakdownChart from '$components/molecules/IncomeBreakdownChart.svelte'
	import IncomeExpenseComparisonChart from '$components/molecules/IncomeExpenseComparisonChart.svelte'
	import TopCategoriesChart from '$components/molecules/TopCategoriesChart.svelte'
	import {
		byCategoryTotal,
		bySummarize,
		byTimeSeries,
		byTopCategoryTotal,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	let { transactions, class: className, ...rest }: Props = $props()

	const summary = $derived(transform(transactions, bySummarize()))
	const timeSeries = $derived(
		transform(
			transactions,
			byTimeSeries(summary.dateRange.start, summary.dateRange.end)
		)
	)
	const categoryTotals = $derived(transform(transactions, byCategoryTotal))
	const topCategories = $derived(transform(transactions, byTopCategoryTotal(8)))
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	{#if transactions.length === 0}
		<Panel>
			<p class="py-12 text-center text-base-content/60">
				No transactions to analyze. Upload a CSV file to get started.
			</p>
		</Panel>
	{:else}
		<AnalyticsStats {summary} />

		<Panel title="Income vs Expenses">
			<IncomeExpenseComparisonChart {timeSeries} />
		</Panel>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<Panel title="Income Breakdown">
				<IncomeBreakdownChart categoryData={categoryTotals} />
			</Panel>

			<Panel title="Expense Breakdown">
				<ExpenseBreakdownChart categoryData={categoryTotals} />
			</Panel>

			<Panel title="Top Spending Categories">
				<TopCategoriesChart {topCategories} />
			</Panel>

			<Panel title="Cash Flow Trend">
				<CashFlowTrendChart {timeSeries} />
			</Panel>
		</div>
	{/if}
</div>
