<script lang="ts">
	import type { Summarize } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import TrendingDownIcon from '@iconify-svelte/lucide/trending-down'
	import TrendingUpIcon from '@iconify-svelte/lucide/trending-up'

	import StatCard from '$components/atoms/StatCard.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			summary: Summarize
		}>

	let { summary, class: className, ...rest }: Props = $props()

	const dayCount = $derived.by(() => {
		const start = summary.dateRange.start.getTime()
		const end = summary.dateRange.end.getTime()
		return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
	})

	const dailyAvgIncome = $derived(
		(summary.totalIncome / dayCount).toLocaleString('th-TH', {
			minimumFractionDigits: 2,
		})
	)

	const dailyAvgExpense = $derived(
		(summary.netExpenses / dayCount).toLocaleString('th-TH', {
			minimumFractionDigits: 2,
		})
	)
</script>

<div
	class={mergeClass(
		['grid', 'grid-cols-1', 'gap-4', 'sm:grid-cols-2'],
		className
	)}
	{...rest}
>
	<StatCard variant="income" title="Daily Avg. Income" value={dailyAvgIncome}>
		{#snippet icon()}
			<TrendingUpIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
	<StatCard
		variant="expense"
		title="Daily Avg. Expense"
		value={dailyAvgExpense}
	>
		{#snippet icon()}
			<TrendingDownIcon class="h-8 w-8" />
		{/snippet}
	</StatCard>
</div>
