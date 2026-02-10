<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import AnalyticsStats from '$components/molecules/AnalyticsStats.svelte'
	import IncomeExpenseComparisonChart from '$components/molecules/IncomeExpenseComparisonChart.svelte'
	import {
		bySummarize,
		byTimeSeries,
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
	{/if}
</div>
