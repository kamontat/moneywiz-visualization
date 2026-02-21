<script lang="ts">
	import type { TooltipItem } from 'chart.js'
	import type { NetWorthSummary } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import LandmarkIcon from '@iconify-svelte/lucide/landmark'
	import TrendingDownIcon from '@iconify-svelte/lucide/trending-down'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'
	import WalletIcon from '@iconify-svelte/lucide/wallet'

	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import StatCard from '$components/atoms/StatCard.svelte'
	import { barChartOptions, toNetWorthChartData } from '$lib/charts'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			netWorth: NetWorthSummary
		}>

	type StatVariant = 'plain' | 'income' | 'expense' | 'neutral' | 'highlight'

	let { netWorth, class: className, ...rest }: Props = $props()

	const hasData = $derived(netWorth.points.length > 0)

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

	const toSignedCurrency = (value: number): string => {
		if (value > 0) return `+${formatCurrency(value)}`
		if (value < 0) return `-${formatCurrency(Math.abs(value))}`
		return formatCurrency(0)
	}

	const toCurrentVariant = (value: number): StatVariant => {
		if (value > 0) return 'highlight'
		if (value < 0) return 'expense'
		return 'neutral'
	}

	const toMonthlyVariant = (value: number): StatVariant => {
		if (value > 0) return 'income'
		if (value < 0) return 'expense'
		return 'neutral'
	}

	const currentNetWorth = $derived(formatCurrency(netWorth.currentNetWorth))
	const monthlyChange = $derived(toSignedCurrency(netWorth.latestMonthlyChange))
	const peakNetWorth = $derived(formatCurrency(netWorth.peakNetWorth))
	const averageMonthlyChange = $derived(
		toSignedCurrency(netWorth.averageMonthlyChange)
	)
	const currentVariant = $derived(toCurrentVariant(netWorth.currentNetWorth))
	const monthlyVariant = $derived(
		toMonthlyVariant(netWorth.latestMonthlyChange)
	)
	const chartData = $derived(toNetWorthChartData(netWorth.points))

	const chartOptions = $derived.by(() => {
		const baseOptions = barChartOptions()

		return {
			...baseOptions,
			plugins: {
				...baseOptions.plugins,
				tooltip: {
					...baseOptions.plugins?.tooltip,
					callbacks: {
						label: (context: TooltipItem<'bar'>) => {
							const value = toNumber(context.raw ?? context.parsed.y)
							return `${context.dataset.label}: ${formatCurrency(value)}`
						},
					},
				},
			},
			scales: {
				...baseOptions.scales,
				y: {
					...baseOptions.scales?.y,
					beginAtZero: false,
				},
			},
		}
	})
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-4'], className)} {...rest}>
	{#if hasData}
		<div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
			<StatCard
				variant={currentVariant}
				title="Current Net Worth"
				value={currentNetWorth}
			>
				{#snippet icon()}
					<WalletIcon class="h-8 w-8" />
				{/snippet}
			</StatCard>
			<StatCard
				variant={monthlyVariant}
				title="Monthly Change"
				value={monthlyChange}
				description={netWorth.points.at(-1)?.label ?? '-'}
			>
				{#snippet icon()}
					{#if netWorth.latestMonthlyChange < 0}
						<TrendingDownIcon class="h-8 w-8" />
					{:else}
						<TrendingUpIcon class="h-8 w-8" />
					{/if}
				{/snippet}
			</StatCard>
			<StatCard
				variant="income"
				title="Peak Net Worth"
				value={peakNetWorth}
				description={netWorth.peakMonth ?? '-'}
			>
				{#snippet icon()}
					<TrendingUpIcon class="h-8 w-8" />
				{/snippet}
			</StatCard>
			<StatCard
				variant="neutral"
				title="Avg Monthly Change"
				value={averageMonthlyChange}
				description={`${netWorth.monthCount.toLocaleString()} months`}
			>
				{#snippet icon()}
					<LandmarkIcon class="h-8 w-8" />
				{/snippet}
			</StatCard>
		</div>

		<ChartCanvas type="bar" data={chartData} options={chartOptions} />
	{:else}
		<p class="py-8 text-center text-sm text-base-content/60">
			No net worth data available
		</p>
	{/if}
</div>
