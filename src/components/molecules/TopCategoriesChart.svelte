<script lang="ts">
	import type { TopCategoryTotal } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		toTopCategoriesBarData,
		horizontalBarChartOptions,
		mergeClass,
	} from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			topCategories: TopCategoryTotal[]
		}>

	let { topCategories, class: className, ...rest }: Props = $props()

	const chartData = $derived(toTopCategoriesBarData(topCategories))
	const chartOptions = $derived(horizontalBarChartOptions())
	const hasData = $derived((chartData.labels?.length ?? 0) > 0)
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if hasData}
		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No category data available
		</p>
	{/if}
</div>
