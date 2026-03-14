<script lang="ts">
	import type { WaterfallStep } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		stackedBarChartOptions,
		toMonthlyWaterfallData,
		mergeClass,
	} from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			steps: WaterfallStep[]
		}>

	let { steps, class: className, ...rest }: Props = $props()

	const chartData = $derived(toMonthlyWaterfallData(steps))
	const chartOptions = $derived(stackedBarChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if steps.length > 0}
		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No monthly waterfall data available
		</p>
	{/if}
</div>
