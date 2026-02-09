<script lang="ts">
	import type { ChartConfiguration } from 'chart.js'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { Chart, registerables } from 'chart.js'
	import { onMount, onDestroy } from 'svelte'

	import { mergeClass } from '$lib/components'

	type ChartType = 'line' | 'bar' | 'doughnut' | 'pie'

	type Props = BaseProps &
		CustomProps<{
			type: ChartType
			data: ChartConfiguration['data']
			options?: ChartConfiguration['options']
		}>

	let { type, data, options, class: className, ...rest }: Props = $props()

	let canvas: HTMLCanvasElement | undefined = $state()
	let chartInstance: Chart | undefined = $state()

	onMount(() => {
		Chart.register(...registerables)
	})

	$effect(() => {
		if (!canvas) return

		if (chartInstance) {
			chartInstance.data = data
			if (options) chartInstance.options = options
			chartInstance.update()
		} else {
			chartInstance = new Chart(canvas, {
				type,
				data,
				options: {
					responsive: true,
					maintainAspectRatio: true,
					...options,
				},
			})
		}
	})

	onDestroy(() => {
		chartInstance?.destroy()
	})
</script>

<div class={mergeClass(['relative', 'w-full'], className)} {...rest}>
	<canvas bind:this={canvas}></canvas>
</div>
