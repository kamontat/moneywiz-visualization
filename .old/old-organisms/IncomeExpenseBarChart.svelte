<script lang="ts">
	import {
		Chart,
		BarController,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend,
		LineController,
		LineElement,
		PointElement,
	} from 'chart.js'
	import type { IncomeExpenseTimeSeries } from '$lib/analytics'

	Chart.register(
		BarController,
		BarElement,
		CategoryScale,
		LinearScale,
		Tooltip,
		Legend,
		LineController,
		LineElement,
		PointElement
	)

	interface Props {
		data: IncomeExpenseTimeSeries
	}

	let { data }: Props = $props()
	let canvas: HTMLCanvasElement | undefined = $state()
	// chart instance is not needed as state, tracked locally in effect

	$effect(() => {
		if (!canvas) return

		const chartInstance = new Chart(canvas, {
			type: 'bar',
			data: {
				labels: data.labels,
				datasets: [
					{
						label: 'Income',
						data: data.income,
						backgroundColor: '#10b981', // emerald-500
						borderRadius: 4,
						order: 2,
					},
					{
						label: 'Expense',
						data: data.expenses,
						backgroundColor: '#f43f5e', // rose-500
						borderRadius: 4,
						order: 3,
					},
					{
						type: 'line',
						label: 'Net',
						data: data.net,
						borderColor: '#3b82f6', // blue-500
						backgroundColor: '#3b82f6',
						borderWidth: 2,
						tension: 0.1,
						pointRadius: 3,
						pointHoverRadius: 5,
						order: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false,
				},
				scales: {
					x: {
						grid: {
							display: false,
						},
					},
					y: {
						beginAtZero: true,
						grid: {
							color: '#f1f5f9', // slate-100
						},
					},
				},
				plugins: {
					legend: {
						position: 'top',
						align: 'end',
						labels: {
							usePointStyle: true,
							boxWidth: 8,
						},
					},
					tooltip: {
						backgroundColor: '#ffffff',
						titleColor: '#0f172a',
						bodyColor: '#334155',
						borderColor: '#e2e8f0',
						borderWidth: 1,
						padding: 10,
						boxPadding: 4,
						callbacks: {
							label: (ctx) => {
								let val = ctx.parsed.y
								if (val === null) return ''
								return (
									ctx.dataset.label +
									': ' +
									new Intl.NumberFormat('th-TH', {
										style: 'currency',
										currency: 'THB',
									}).format(val)
								)
							},
						},
					},
				},
			},
		})

		return () => {
			chartInstance.destroy()
		}
	})
</script>

<div
	class="border-mw-border bg-mw-surface relative h-[300px] w-full rounded-xl border p-4 shadow-sm"
>
	<canvas bind:this={canvas}></canvas>
</div>
