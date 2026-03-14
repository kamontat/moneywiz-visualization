<script lang="ts">
	import type { Summarize } from '$lib/app/dashboard'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import PiggyBankIcon from '@iconify-svelte/lucide/piggy-bank'
	import TrendingDownIcon from '@iconify-svelte/lucide/trending-down'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'
	import WalletIcon from '@iconify-svelte/lucide/wallet'

	import StatCard from '$components/atoms/StatCard.svelte'
	import { mergeClass } from '$lib/ui'
	import { formatCurrency } from '$lib/utils'

	type Props = BaseProps &
		CustomProps<{
			summary: Summarize
			baselineSummary?: Summarize
		}>

	let { summary, baselineSummary, class: className, ...rest }: Props = $props()

	const formatPercent = (value: number): string => {
		return `${value.toLocaleString('th-TH', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}%`
	}

	const formatDelta = (
		current: number,
		baseline: number | undefined,
		unit: 'currency' | 'percent'
	): string | undefined => {
		if (baseline === undefined) return undefined

		const delta = current - baseline
		const sign = delta > 0 ? '+' : ''
		const epsilon = 1e-9
		const deltaPct =
			Math.abs(baseline) < epsilon ? null : (delta / Math.abs(baseline)) * 100
		const valueLabel =
			unit === 'percent'
				? `${sign}${delta.toLocaleString('th-TH', {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}pp`
				: `${sign}${formatCurrency(delta)}`

		if (deltaPct === null) {
			return `vs baseline: ${valueLabel}`
		}

		return `vs baseline: ${valueLabel} (${sign}${deltaPct.toLocaleString(
			'th-TH',
			{
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			}
		)}%)`
	}

	const income = $derived(formatCurrency(summary.totalIncome))
	const expenses = $derived(formatCurrency(summary.netExpenses))
	const net = $derived(formatCurrency(summary.netCashFlow))
	const savings = $derived(formatPercent(summary.savingsRate))

	const incomeDelta = $derived(
		formatDelta(summary.totalIncome, baselineSummary?.totalIncome, 'currency')
	)
	const expenseDelta = $derived(
		formatDelta(summary.netExpenses, baselineSummary?.netExpenses, 'currency')
	)
	const netDelta = $derived(
		formatDelta(summary.netCashFlow, baselineSummary?.netCashFlow, 'currency')
	)
	const savingsDelta = $derived(
		formatDelta(summary.savingsRate, baselineSummary?.savingsRate, 'percent')
	)

	const netVariant = 'neutral' // Blue
	const savingsVariant = 'highlight' // Purple
</script>

<div
	class={mergeClass(
		['grid', 'grid-cols-1', 'gap-4', 'sm:grid-cols-2', 'lg:grid-cols-4'],
		className
	)}
	{...rest}
>
	<StatCard
		variant="income"
		title="Total Income"
		value={income}
		description={incomeDelta}
	>
		{#snippet icon()}
			<TrendingUpIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard
		variant="expense"
		title="Total Expenses"
		value={expenses}
		description={expenseDelta}
	>
		{#snippet icon()}
			<TrendingDownIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard
		variant={netVariant}
		title="Net Flow"
		value={net}
		description={netDelta}
	>
		{#snippet icon()}
			<WalletIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard
		variant={savingsVariant}
		title="Saving Rate"
		value={savings}
		description={savingsDelta}
	>
		{#snippet icon()}
			<PiggyBankIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
</div>
