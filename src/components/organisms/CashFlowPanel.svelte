<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import Panel from '$components/atoms/Panel.svelte'
	import ExperimentPayeeCashFlow from '$components/molecules/ExperimentPayeeCashFlow.svelte'
	import {
		byDebt,
		byPayeeCashFlow,
		byWindfallGiveaway,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	let { transactions, class: className, ...rest }: Props = $props()

	const entries = $derived(transform(transactions, byPayeeCashFlow))
	const debtPoints = $derived(transform(transactions, byDebt))
	const windfallGiveawayPoints = $derived(
		transform(transactions, byWindfallGiveaway)
	)
</script>

<div
	class={mergeClass(
		['grid', 'grid-cols-1', 'gap-6', '2xl:grid-cols-2'],
		className
	)}
	{...rest}
>
	<Panel title="1) Debt & Repayment">
		<p class="mb-3 text-sm text-base-content/70">
			Who has debt with whom — ranks payees by debt taken vs repaid.
		</p>
		<ExperimentPayeeCashFlow
			{entries}
			variant="debt"
			monthlyPoints={debtPoints}
		/>
	</Panel>

	<Panel title="2) Windfall & Giveaway">
		<p class="mb-3 text-sm text-base-content/70">
			Who gave and received — ranks payees by windfall income and giveaway
			spending.
		</p>
		<ExperimentPayeeCashFlow
			{entries}
			variant="windfallGiveaway"
			monthlyPoints={windfallGiveawayPoints}
		/>
	</Panel>
</div>
