<script lang="ts">
	import type { Summarize } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import PiggyBankIcon from '@iconify-svelte/lucide/piggy-bank'
	import TrendingDownIcon from '@iconify-svelte/lucide/trending-down'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'
	import WalletIcon from '@iconify-svelte/lucide/wallet'

	import StatCard from '$components/atoms/StatCard.svelte'
	import { mergeClass } from '$lib/components'
	import { formatCurrency } from '$lib/formatters/amount'

	type Props = BaseProps &
		CustomProps<{
			summary: Summarize
		}>

	let { summary, class: className, ...rest }: Props = $props()

	const income = $derived(formatCurrency(summary.totalIncome))
	const expenses = $derived(formatCurrency(summary.netExpenses))
	const net = $derived(formatCurrency(summary.netCashFlow))
	const savings = $derived(
		summary.savingsRate.toLocaleString('th-TH', { minimumFractionDigits: 2 }) +
			'%'
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
	<StatCard variant="income" title="Total Income" value={income}>
		{#snippet icon()}
			<TrendingUpIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard variant="expense" title="Total Expenses" value={expenses}>
		{#snippet icon()}
			<TrendingDownIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard variant={netVariant} title="Net Flow" value={net}>
		{#snippet icon()}
			<WalletIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard variant={savingsVariant} title="Saving Rate" value={savings}>
		{#snippet icon()}
			<PiggyBankIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
</div>
