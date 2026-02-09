<script lang="ts">
	import type { FilterState as BaseFilterState } from '$lib/analytics/filters/models/state'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import { mergeClass } from '$lib/components'

	type FilterState = BaseFilterState & { categories: string[] }

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
		'Expense',
		'Income',
		'Refund',
		'Transfer',
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

	const tagOptionBase = [
		'd-badge',
		'cursor-pointer',
		'd-badge-md',
		'text-sm',
		'text-center',
		'leading-snug',
		'h-auto',
		'min-h-6',
		'whitespace-normal',
		'break-words',
		'py-1',
		'transition-all',
		'w-full',
		'justify-center',
	]
	const tagOptionInactiveClass =
		'd-badge-outline text-base-content/70 hover:d-badge-primary'
	const tagOptionIncludeClass = 'border-info/30 bg-info/10 text-info'
</script>

{#if openPanel === 'types'}
	<div class={mergeClass(['flex', 'flex-col', 'gap-4'], className)} {...rest}>
		<div class="flex items-center justify-between">
			<span
				class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
			>
				Transaction Type
			</span>
			{#if hasTypeFilter}
				<button
					type="button"
					class="text-xs text-base-content/60 transition-colors hover:text-base-content"
					onclick={clearTransactionTypes}
				>
					Clear
				</button>
			{/if}
		</div>
		<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
			{#each transactionTypes as type (type)}
				<button
					type="button"
					class={mergeClass(
						tagOptionBase,
						filterState.transactionTypes.includes(type)
							? tagOptionIncludeClass
							: tagOptionInactiveClass
					)}
					onclick={() => toggleTransactionType(type)}
				>
					{type}
				</button>
			{/each}
		</div>
	</div>
{/if}
