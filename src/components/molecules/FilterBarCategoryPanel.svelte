<script lang="ts">
	import type { FilterState } from '$components/molecules/models/filterBar'
	import type { FilterCategoryMode } from '$lib/analytics/filters/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedCategory } from '$lib/transactions/models'
	import { SvelteSet } from 'svelte/reactivity'

	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterOptionBadge from '$components/atoms/FilterOptionBadge.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'
	import FilterSearchInput from '$components/atoms/FilterSearchInput.svelte'
	import { mergeClass } from '$lib/components'
	import { getCategoryFullName } from '$lib/transactions/utils'

	type _CategoryOption = {
		fullName: string
		displayName: string
		category: string
		subcategory: string
	}

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availableCategories: ParsedCategory[]
			openPanel: string | null
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		availableCategories = [],
		openPanel = null,
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	let categoryQuery = $state('')
	let debounceTimer = $state<ReturnType<typeof setTimeout> | null>(null)
	let debouncedQuery = $state('')

	const hasCategoryFilter = $derived(filterState.categories.length > 0)
	const categoryMode = $derived(filterState.categoryMode)

	const selectedSet = $derived(new SvelteSet(filterState.categories))

	const categoryOptions = $derived.by(() => {
		return availableCategories.map((cat) => {
			const fullName = getCategoryFullName(cat)
			return {
				fullName,
				displayName: fullName.trim() ? fullName : 'Uncategorized',
				category: cat.category,
				subcategory: cat.subcategory,
			}
		})
	})

	const searchResults = $derived.by(() => {
		const query = debouncedQuery.trim().toLowerCase()
		if (!query) return []
		return categoryOptions
			.filter((option) => option.displayName.toLowerCase().includes(query))
			.slice(0, 50)
	})

	const selectedCategories = $derived.by(() => {
		return filterState.categories.filter((c) =>
			categoryOptions.some((option) => option.fullName === c)
		)
	})

	const onQueryInput = (value: string) => {
		categoryQuery = value
		if (debounceTimer !== null) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => {
			debouncedQuery = value
			debounceTimer = null
		}, 200)
	}

	const updateCategories = (categories: string[]) => {
		filterState = {
			...filterState,
			categories,
			categoryMode:
				categories.length > 0 ? filterState.categoryMode : 'include',
		}
		onfilterchange?.(filterState)
	}

	const toggleCategoryMode = () => {
		if (!hasCategoryFilter) return

		const nextMode: FilterCategoryMode =
			filterState.categoryMode === 'include' ? 'exclude' : 'include'
		filterState = {
			...filterState,
			categoryMode: nextMode,
		}
		onfilterchange?.(filterState)
	}

	const toggleCategory = (category: string) => {
		const current = filterState.categories
		const updated = current.includes(category)
			? current.filter((c: string) => c !== category)
			: [...current, category]
		updateCategories(updated)
	}

	const clearCategoryFilter = () => {
		filterState = {
			...filterState,
			categories: [],
			categoryMode: 'include',
		}
		onfilterchange?.(filterState)
	}

	const showSearchResults = $derived(debouncedQuery.trim().length > 0)
	const noResults = $derived(showSearchResults && searchResults.length === 0)
</script>

<CollapsiblePanel open={openPanel === 'category'} class={className} {...rest}>
	<FilterPanelHeader
		title="Category"
		showClear={hasCategoryFilter}
		onclear={clearCategoryFilter}
	>
		{#snippet actions()}
			{#if hasCategoryFilter}
				<div class="flex items-center gap-2">
					<span
						class={mergeClass(
							['text-xs', 'font-bold', 'tracking-wide', 'uppercase'],
							categoryMode === 'include' ? 'text-success' : 'text-error'
						)}
					>
						{categoryMode}
					</span>
					<input
						type="checkbox"
						class="d-toggle d-toggle-xs"
						class:d-toggle-success={categoryMode === 'include'}
						class:d-toggle-error={categoryMode === 'exclude'}
						class:text-success={categoryMode === 'include'}
						class:text-error={categoryMode === 'exclude'}
						checked={categoryMode === 'include'}
						onclick={toggleCategoryMode}
					/>
				</div>
			{/if}
		{/snippet}
	</FilterPanelHeader>

	<div class="flex flex-col gap-3">
		<FilterSearchInput
			placeholder="Search categories..."
			value={categoryQuery}
			oninput={(e) => onQueryInput((e.target as HTMLInputElement).value)}
		/>

		{#if selectedCategories.length > 0}
			<div class="flex flex-col gap-1.5">
				<span
					class="text-xs font-semibold tracking-wider text-base-content/60 uppercase"
				>
					Selected
				</span>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
					{#each selectedCategories as category (category)}
						<FilterOptionBadge
							variant={categoryMode}
							active={true}
							onclick={() => toggleCategory(category)}
						>
							{category || 'Uncategorized'}
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
						{#each searchResults as option (option.fullName)}
							<FilterOptionBadge
								variant={categoryMode}
								active={selectedSet.has(option.fullName)}
								onclick={() => toggleCategory(option.fullName)}
							>
								{option.displayName}
							</FilterOptionBadge>
						{/each}
					</div>
				{/if}
			</div>
		{:else if !hasCategoryFilter}
			<p class="text-xs text-base-content/50">
				Type to search among {categoryOptions.length} categories
			</p>
		{/if}
	</div>
</CollapsiblePanel>
