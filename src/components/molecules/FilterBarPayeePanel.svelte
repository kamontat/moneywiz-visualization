<script lang="ts">
	import type { FilterState } from '$components/molecules/models/filterBar'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { SvelteSet } from 'svelte/reactivity'

	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterOptionBadge from '$components/atoms/FilterOptionBadge.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'
	import FilterSearchInput from '$components/atoms/FilterSearchInput.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availablePayees: string[]
			openPanel: string | null
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		availablePayees = [],
		openPanel = null,
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	let payeeQuery = $state('')
	let debounceTimer = $state<ReturnType<typeof setTimeout> | null>(null)
	let debouncedQuery = $state('')

	const hasPayeeFilter = $derived(filterState.payees.length > 0)

	const selectedSet = $derived(new SvelteSet(filterState.payees))

	const searchResults = $derived.by(() => {
		const query = debouncedQuery.trim().toLowerCase()
		if (!query) return []
		return availablePayees
			.filter((p) => p.toLowerCase().includes(query))
			.slice(0, 50)
	})

	const selectedPayees = $derived.by(() => {
		return filterState.payees.filter((p) => availablePayees.includes(p))
	})

	const onQueryInput = (value: string) => {
		payeeQuery = value
		if (debounceTimer !== null) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			debouncedQuery = value
			debounceTimer = null
		}, 200)
	}

	const updatePayees = (payees: string[]) => {
		filterState = { ...filterState, payees }
		onfilterchange?.(filterState)
	}

	const togglePayee = (payee: string) => {
		const current = filterState.payees
		const updated = current.includes(payee)
			? current.filter((p) => p !== payee)
			: [...current, payee]
		updatePayees(updated)
	}

	const clearPayeeFilter = () => {
		filterState = { ...filterState, payees: [] }
		onfilterchange?.(filterState)
	}

	const showSearchResults = $derived(debouncedQuery.trim().length > 0)
	const noResults = $derived(showSearchResults && searchResults.length === 0)
</script>

<CollapsiblePanel open={openPanel === 'payee'} class={className} {...rest}>
	<FilterPanelHeader
		title="Payee"
		showClear={hasPayeeFilter}
		onclear={clearPayeeFilter}
	/>

	<div class="flex flex-col gap-3">
		<FilterSearchInput
			placeholder="Search payees..."
			value={payeeQuery}
			oninput={(e) => onQueryInput((e.target as HTMLInputElement).value)}
		/>

		{#if selectedPayees.length > 0}
			<div class="flex flex-col gap-1.5">
				<span
					class="text-xs font-semibold tracking-wider text-base-content/60 uppercase"
				>
					Selected
				</span>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
					{#each selectedPayees as payee (payee)}
						<FilterOptionBadge
							variant="include"
							active={true}
							onclick={() => togglePayee(payee)}
						>
							{payee || 'Unknown'}
						</FilterOptionBadge>
					{/each}
				</div>
			</div>
		{/if}

		{#if showSearchResults}
			<div class="flex flex-col gap-1.5">
				<span
					class="text-xs font-semibold tracking-wider text-base-content/60 uppercase"
				>
					{noResults ? 'No results' : 'Results'}
				</span>
				{#if !noResults}
					<div
						class={mergeClass([
							'grid',
							'grid-cols-2',
							'gap-2',
							'sm:grid-cols-3',
							'lg:grid-cols-4',
							'max-h-[40vh]',
							'overflow-y-auto',
						])}
					>
						{#each searchResults as payee (payee)}
							<FilterOptionBadge
								variant="include"
								active={selectedSet.has(payee)}
								onclick={() => togglePayee(payee)}
							>
								{payee || 'Unknown'}
							</FilterOptionBadge>
						{/each}
					</div>
				{/if}
			</div>
		{:else if !hasPayeeFilter}
			<p class="text-xs text-base-content/50">
				Type to search among {availablePayees.length} payees
			</p>
		{/if}
	</div>
</CollapsiblePanel>
