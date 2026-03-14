<script lang="ts">
	import type { RefundImpactPoint } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		stackedBarChartOptions,
		toRefundImpactData,
		mergeClass,
	} from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			points: RefundImpactPoint[]
		}>

	let { points, class: className, ...rest }: Props = $props()

	const chartData = $derived(toRefundImpactData(points))
	const chartOptions = $derived(stackedBarChartOptions())
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if points.length > 0}
		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No refund impact data available
		</p>
	{/if}
</div>
