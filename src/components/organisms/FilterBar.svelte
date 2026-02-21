<script lang="ts">
	import type {
		FilterState,
		TagCategory,
	} from '$components/molecules/models/filterBar'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedCategory } from '$lib/transactions/models'
	import FilterBarAccountPanel from '../molecules/FilterBarAccountPanel.svelte'
	import FilterBarCategoryPanel from '../molecules/FilterBarCategoryPanel.svelte'
	import FilterBarChips from '../molecules/FilterBarChips.svelte'
	import FilterBarDatePanel from '../molecules/FilterBarDatePanel.svelte'
	import FilterBarPayeePanel from '../molecules/FilterBarPayeePanel.svelte'
	import FilterBarTagPanel from '../molecules/FilterBarTagPanel.svelte'
	import FilterBarTypesPanel from '../molecules/FilterBarTypesPanel.svelte'

	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availableCategories: ParsedCategory[]
			availableTagCategories: TagCategory[]
			availablePayees?: string[]
			availableAccounts?: string[]
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		availableCategories = [],
		availableTagCategories = [],
		availablePayees = [],
		availableAccounts = [],
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	// Track which filter panel is open (null = all closed)
	let openPanel = $state<string | null>(null)
	const clearFilters = () => {
		filterState = {
			dateRange: { start: undefined, end: undefined },
			transactionTypes: [],
			transactionTypeMode: 'include',
			categories: [],
			categoryMode: 'include',
			tags: [],
			payees: [],
			accounts: [],
		}
		onfilterchange?.(filterState)
		openPanel = null
	}

	// Toggle panel open/closed
	const togglePanel = (panel: string) => {
		openPanel = openPanel === panel ? null : panel
	}
</script>

<div
	class={mergeClass(['w-full'], className)}
	{...rest}
	data-testid="filter-bar"
>
	<!-- Horizontal Filter Chips Row -->
	<FilterBarChips
		{filterState}
		{availableTagCategories}
		{openPanel}
		ontogglepanel={togglePanel}
		onclearfilters={clearFilters}
	/>

	<!-- Full-Width Dropdown Panels -->
	{#if openPanel !== null}
		<div
			class="mt-1 rounded-lg border border-base-300/60 bg-base-100 p-4 shadow-lg"
		>
			<FilterBarDatePanel bind:filterState {openPanel} {onfilterchange} />
			<FilterBarCategoryPanel
				bind:filterState
				{availableCategories}
				{openPanel}
				{onfilterchange}
			/>
			<FilterBarTypesPanel bind:filterState {openPanel} {onfilterchange} />
			<FilterBarPayeePanel
				bind:filterState
				{availablePayees}
				{openPanel}
				{onfilterchange}
			/>
			<FilterBarAccountPanel
				bind:filterState
				{availableAccounts}
				{openPanel}
				{onfilterchange}
			/>
			{#each availableTagCategories as tagCategory (tagCategory.category)}
				<FilterBarTagPanel
					bind:filterState
					{openPanel}
					{tagCategory}
					{onfilterchange}
				/>
			{/each}
		</div>
	{/if}
</div>
