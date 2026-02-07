<script lang="ts">
	import type { Summarize } from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
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

	const netVariant = $derived(summary.netTotal >= 0 ? 'success' : 'error')
</script>

<div
	class={mergeClass(['d-stats', 'd-stats-horizontal', 'shadow'], className)}
	{...rest}
>
	<StatCard variant="success" title="Total Income" value={income} />
	<StatCard variant="error" title="Total Expenses" value={expenses} />
	<StatCard variant={netVariant} title="Net Flow" value={net} />
	<StatCard variant="primary" title="Saving Rate" value={savings} />
</div>
