<script lang="ts">
	import type { FilterState } from '$components/molecules/models/filterBar'
	import type { TransactionTypeFilterMode } from '$lib/analytics/filters/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterOptionBadge from '$components/atoms/FilterOptionBadge.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'
	import { mergeClass } from '$lib/components'
	import { formatTransactionType } from '$lib/formatters/transactionType'

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
		'Reconcile',
		'Refund',
		'Sell',
		'Transfer',
		'Windfall',
	]

	const hasTypeFilter = $derived(filterState.transactionTypes.length > 0)
	const transactionTypeMode = $derived(filterState.transactionTypeMode)

	const updateTransactionTypes = (
		transactionTypes: ParsedTransactionType[]
	) => {
		filterState = {
			...filterState,
			transactionTypes,
			transactionTypeMode:
				transactionTypes.length > 0
					? filterState.transactionTypeMode
					: 'include',
		}
		onfilterchange?.(filterState)
	}

	const toggleTransactionType = (type: ParsedTransactionType) => {
		const current = filterState.transactionTypes
		const updated = current.includes(type)
			? current.filter((t) => t !== type)
			: [...current, type]
		updateTransactionTypes(updated)
	}

	const toggleTransactionTypeMode = () => {
		if (!hasTypeFilter) return

		const nextMode: TransactionTypeFilterMode =
			filterState.transactionTypeMode === 'include' ? 'exclude' : 'include'
		filterState = {
			...filterState,
			transactionTypeMode: nextMode,
		}
		onfilterchange?.(filterState)
	}

	const clearTransactionTypes = () => {
		filterState = {
			...filterState,
			transactionTypes: [],
			transactionTypeMode: 'include',
		}
		onfilterchange?.(filterState)
	}
</script>

<CollapsiblePanel open={openPanel === 'types'} class={className} {...rest}>
	<FilterPanelHeader
		title="Transaction Type"
		showClear={hasTypeFilter}
		onclear={clearTransactionTypes}
	>
		{#snippet actions()}
			{#if hasTypeFilter}
				<div class="flex items-center gap-2">
					<span
						class={mergeClass(
							['text-xs', 'font-bold', 'tracking-wide', 'uppercase'],
							transactionTypeMode === 'include' ? 'text-success' : 'text-error'
						)}
					>
						{transactionTypeMode}
					</span>
					<input
						type="checkbox"
						class="d-toggle d-toggle-xs"
						class:d-toggle-success={transactionTypeMode === 'include'}
						class:d-toggle-error={transactionTypeMode === 'exclude'}
						class:text-success={transactionTypeMode === 'include'}
						class:text-error={transactionTypeMode === 'exclude'}
						checked={transactionTypeMode === 'include'}
						onclick={toggleTransactionTypeMode}
					/>
				</div>
			{/if}
		{/snippet}
	</FilterPanelHeader>
	<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
		{#each transactionTypes as type (type)}
			<FilterOptionBadge
				variant={transactionTypeMode}
				active={filterState.transactionTypes.includes(type)}
				onclick={() => toggleTransactionType(type)}
			>
				{formatTransactionType(type)}
			</FilterOptionBadge>
		{/each}
	</div>
</CollapsiblePanel>
