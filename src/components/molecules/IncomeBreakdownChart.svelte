<script lang="ts">
	import type { ActiveElement, Chart, ChartEvent, TooltipItem } from 'chart.js'
	import type { CategoryTotal } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import { toCategoryDoughnutData, doughnutChartOptions } from '$lib/charts'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			categoryData: Record<ParsedTransactionType, CategoryTotal>
		}>

	let { categoryData, class: className, ...rest }: Props = $props()

	let selectedParent = $state<string | undefined>()

	const toNumber = (value: unknown): number => {
		if (typeof value === 'number' && Number.isFinite(value)) {
			return value
		}

		if (typeof value === 'string') {
			const parsed = Number(value)
			return Number.isFinite(parsed) ? parsed : 0
		}

		return 0
	}

	const chartData = $derived(
		toCategoryDoughnutData(categoryData, 'Income', {
			parent: selectedParent,
		})
	)
	const legendItems = $derived.by(() => {
		const labels = (chartData.labels ?? []).map(String)
		const rawColors = chartData.datasets[0]?.backgroundColor
		const colors = Array.isArray(rawColors) ? rawColors : []

		return labels.map((label, index) => {
			const color = colors[index]
			return {
				label,
				color: typeof color === 'string' ? color : '#94a3b8',
			}
		})
	})

	const isCenterClick = (
		event: ChartEvent,
		chart: Chart<'doughnut'>
	): boolean => {
		const firstArc = chart.getDatasetMeta(0).data[0]
		if (!firstArc) return false

		if (typeof event.x !== 'number' || typeof event.y !== 'number') {
			return false
		}

		const { x, y, innerRadius } = firstArc.getProps(
			['x', 'y', 'innerRadius'],
			true
		)
		const distance = Math.hypot(event.x - x, event.y - y)
		return distance <= innerRadius
	}

	const onChartClick = (
		event: ChartEvent,
		activeElements: ActiveElement[],
		chart: Chart<'doughnut'>
	) => {
		const incomeTotals = categoryData.Income
		if (!incomeTotals) return

		if (!selectedParent && activeElements.length > 0) {
			const [firstElement] = activeElements
			const label = chart.data.labels?.[firstElement.index]

			if (
				typeof label === 'string' &&
				Object.hasOwn(incomeTotals.parents, label)
			) {
				selectedParent = label
			}

			return
		}

		if (selectedParent && activeElements.length === 0) {
			if (isCenterClick(event, chart)) {
				selectedParent = undefined
			}
		}
	}

	const chartOptions = $derived({
		...doughnutChartOptions(),
		plugins: {
			...doughnutChartOptions().plugins,
			tooltip: {
				...doughnutChartOptions().plugins?.tooltip,
				callbacks: {
					label: (context: TooltipItem<'doughnut'>) => {
						const value = Math.abs(toNumber(context.raw ?? context.parsed))
						const total = context.dataset.data.reduce(
							(sum, datum) => sum + Math.abs(toNumber(datum)),
							0
						)
						const percentage = total > 0 ? (value / total) * 100 : 0
						return `${formatCurrency(value)} (${percentage.toFixed(1)}%)`
					},
				},
			},
			legend: {
				display: false,
			},
		},
		radius: '78%',
		onClick: onChartClick,
	})

	const hasData = $derived((chartData.labels?.length ?? 0) > 0)

	$effect(() => {
		if (!selectedParent) return

		const incomeTotals = categoryData.Income
		if (!incomeTotals || !Object.hasOwn(incomeTotals.parents, selectedParent)) {
			selectedParent = undefined
		}
	})
</script>

<div class={mergeClass([], className)} {...rest}>
	{#if hasData}
		{#if selectedParent}
			<div class="mb-3 flex items-center justify-between gap-3">
				<p class="truncate text-sm text-base-content/70">
					Showing subcategories of
					<span class="font-medium text-base-content">{selectedParent}</span>
				</p>
				<button
					type="button"
					class="d-btn shrink-0 d-btn-ghost d-btn-sm"
					onclick={() => (selectedParent = undefined)}
				>
					Back
				</button>
			</div>
		{/if}
		<div class="mx-auto w-72 sm:w-80 lg:w-96">
			<ChartCanvas type="doughnut" data={chartData} options={chartOptions} />
		</div>
		<div class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
			{#each legendItems as item (item.label)}
				<span class="inline-flex items-center gap-2 text-base-content/85">
					<span
						class="inline-block h-3 w-3 rounded-sm border border-base-100/70"
						style={`background-color: ${item.color}`}
					></span>
					{item.label}
				</span>
			{/each}
		</div>
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No income data available
		</p>
	{/if}
</div>
