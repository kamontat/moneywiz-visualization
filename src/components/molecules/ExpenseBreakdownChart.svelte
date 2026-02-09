<script lang="ts">
	import type { CategoryTotal } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { toCategoryDoughnutData, doughnutChartOptions } from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			categoryData: Record<ParsedTransactionType, CategoryTotal>
		}>

	let { categoryData, class: className, ...rest }: Props = $props()

	const chartData = $derived(toCategoryDoughnutData(categoryData, 'Expense'))
	const chartOptions = $derived(doughnutChartOptions())
	const hasData = $derived((chartData.labels?.length ?? 0) > 0)
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if hasData}
		<ChartCanvas type="doughnut" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No expense data available
		</p>
	{/if}
</div>
