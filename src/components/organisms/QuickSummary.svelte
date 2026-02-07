<script lang="ts">
	import type { Summarize } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import PiggyBankIcon from '@iconify-svelte/lucide/piggy-bank'
	import TrendingDownIcon from '@iconify-svelte/lucide/trending-down'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'
	import WalletIcon from '@iconify-svelte/lucide/wallet'

	import StatCard from '$components/atoms/StatCard.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			summary: Summarize
		}>

	let { summary, class: className, ...rest }: Props = $props()

	const income = $derived(
		summary.totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })
	)
	const expenses = $derived(
		Math.abs(summary.totalExpenses).toLocaleString('th-TH', {
			minimumFractionDigits: 2,
		})
	)
	const net = $derived(
		summary.netTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })
	)
	const savings = $derived(
		summary.savingRate.toLocaleString('th-TH', { minimumFractionDigits: 2 }) +
			'%'
	)

	const netVariant = $derived(summary.netTotal >= 0 ? 'income' : 'expense')
	const savingsVariant = $derived(
		summary.savingRate >= 0 ? 'highlight' : 'expense'
	)
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
