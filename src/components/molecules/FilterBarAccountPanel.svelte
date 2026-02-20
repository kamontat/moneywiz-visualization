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
			availableAccounts: string[]
			openPanel: string | null
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		availableAccounts = [],
		openPanel = null,
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	let accountQuery = $state('')
	let debounceTimer = $state<ReturnType<typeof setTimeout> | null>(null)
	let debouncedQuery = $state('')

	const hasAccountFilter = $derived(filterState.accounts.length > 0)

	const selectedSet = $derived(new SvelteSet(filterState.accounts))

	const searchResults = $derived.by(() => {
		const query = debouncedQuery.trim().toLowerCase()
		if (!query) return []
		return availableAccounts
			.filter((a) => a.toLowerCase().includes(query))
			.slice(0, 50)
	})

	const selectedAccounts = $derived.by(() => {
		return filterState.accounts.filter((a) => availableAccounts.includes(a))
	})

	const onQueryInput = (value: string) => {
		accountQuery = value
		if (debounceTimer !== null) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			debouncedQuery = value
			debounceTimer = null
		}, 200)
	}

	const updateAccounts = (accounts: string[]) => {
		filterState = { ...filterState, accounts }
		onfilterchange?.(filterState)
	}

	const toggleAccount = (account: string) => {
		const current = filterState.accounts
		const updated = current.includes(account)
			? current.filter((a) => a !== account)
			: [...current, account]
		updateAccounts(updated)
	}

	const clearAccountFilter = () => {
		filterState = { ...filterState, accounts: [] }
		onfilterchange?.(filterState)
	}

	const showSearchResults = $derived(debouncedQuery.trim().length > 0)
	const noResults = $derived(showSearchResults && searchResults.length === 0)
</script>

<CollapsiblePanel
	open={openPanel === 'account'}
	class={className}
	{...rest}
	data-testid="filter-account-panel"
>
	<FilterPanelHeader
		title="Account"
		showClear={hasAccountFilter}
		onclear={clearAccountFilter}
	/>

	<div class="flex flex-col gap-3">
		<FilterSearchInput
			placeholder="Search accounts..."
			value={accountQuery}
			oninput={(e) => onQueryInput((e.target as HTMLInputElement).value)}
			data-testid="account-search-input"
		/>

		{#if selectedAccounts.length > 0}
			<div class="flex flex-col gap-1.5">
				<span
					class="text-xs font-semibold tracking-wider text-base-content/60 uppercase"
				>
					Selected
				</span>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
					{#each selectedAccounts as account (account)}
						<FilterOptionBadge
							variant="include"
							active={true}
							onclick={() => toggleAccount(account)}
							data-testid="selected-account"
						>
							{account || 'Unknown'}
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
						{#each searchResults as account (account)}
							<FilterOptionBadge
								variant="include"
								active={selectedSet.has(account)}
								onclick={() => toggleAccount(account)}
								data-testid="account-option"
							>
								{account || 'Unknown'}
							</FilterOptionBadge>
						{/each}
					</div>
				{/if}
			</div>
		{:else if !hasAccountFilter}
			<p class="text-xs text-base-content/50" data-testid="account-count-text">
				Type to search among {availableAccounts.length} accounts
			</p>
		{/if}
	</div>
</CollapsiblePanel>
