<script lang="ts">
	import type { FilterState } from '$components/molecules/models/filterBar'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterOptionBadge from '$components/atoms/FilterOptionBadge.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			openPanel: string | null
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		openPanel = null,
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	const transactionTypes: ParsedTransactionType[] = [
		'Buy',
		'Debt',
		'DebtRepayment',
		'Expense',
		'Giveaway',
		'Income',
		'Refund',
		'Sell',
		'Transfer',
		'Windfall',
	]

	const hasTypeFilter = $derived(filterState.transactionTypes.length > 0)

	const toggleTransactionType = (type: ParsedTransactionType) => {
		const current = filterState.transactionTypes
		const updated = current.includes(type)
			? current.filter((t) => t !== type)
			: [...current, type]
		filterState = {
			...filterState,
			transactionTypes: updated,
		}
		onfilterchange?.(filterState)
	}

	const clearTransactionTypes = () => {
		filterState = { ...filterState, transactionTypes: [] }
		onfilterchange?.(filterState)
	}
</script>

<CollapsiblePanel open={openPanel === 'types'} class={className} {...rest}>
	<FilterPanelHeader
		title="Transaction Type"
		showClear={hasTypeFilter}
		onclear={clearTransactionTypes}
	/>
	<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
		{#each transactionTypes as type (type)}
			<FilterOptionBadge
				active={filterState.transactionTypes.includes(type)}
				onclick={() => toggleTransactionType(type)}
			>
				{type}
			</FilterOptionBadge>
		{/each}
	</div>
</CollapsiblePanel>
