<script lang="ts">
	import type { FilterState } from '$components/molecules/models/filterBar'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedCategory } from '$lib/transactions/models'
	import { SvelteMap } from 'svelte/reactivity'

	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterOptionBadge from '$components/atoms/FilterOptionBadge.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'
	import FilterSearchInput from '$components/atoms/FilterSearchInput.svelte'
	import { mergeClass } from '$lib/components'
	import { getCategoryFullName } from '$lib/transactions/utils'

	type CategoryOption = {
		fullName: string
		displayName: string
		category: string
		subcategory: string
	}

	type CategoryGroup = {
		name: string
		options: CategoryOption[]
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

	const hasCategoryFilter = $derived(filterState.categories.length > 0)

	const categoryOptions = $derived.by(() => {
		const options: CategoryOption[] = availableCategories.map((cat) => {
			const fullName = getCategoryFullName(cat)
			return {
				fullName,
				displayName: fullName.trim() ? fullName : 'Uncategorized',
				category: cat.category,
				subcategory: cat.subcategory,
			}
		})
		const query = categoryQuery.trim().toLowerCase()
		if (!query) return options
		return options.filter((option) =>
			option.displayName.toLowerCase().includes(query)
		)
	})

	const categoryGroups = $derived.by(() => {
		const groups = new SvelteMap<string, CategoryOption[]>()
		for (const option of categoryOptions) {
			const name = option.category.trim() ? option.category : 'Uncategorized'
			const entries = groups.get(name) ?? []
			entries.push(option)
			groups.set(name, entries)
		}
		return Array.from(groups.entries(), ([name, options]) => ({
			name,
			options,
		}))
	})

	const categorySubGroups = $derived.by(() => {
		return categoryGroups
			.map((group) => ({
				...group,
				options: group.options.filter(
					(option) =>
						option.subcategory.trim() ||
						(!option.category.trim() && !option.subcategory.trim())
				),
			}))
			.filter((group) => group.options.length > 0)
	})

	const allSelectableCategoryNames = $derived.by(() => {
		return Array.from(
			new Set(
				availableCategories
					.filter(
						(cat) =>
							cat.subcategory.trim() ||
							(!cat.category.trim() && !cat.subcategory.trim())
					)
					.map((cat) => getCategoryFullName(cat))
			)
		)
	})

	const allCategoriesSelected = $derived.by(() => {
		if (allSelectableCategoryNames.length === 0) return false
		return allSelectableCategoryNames.every((name) =>
			filterState.categories.includes(name)
		)
	})

	const toggleCategory = (category: string) => {
		const current = filterState.categories
		const updated = current.includes(category)
			? current.filter((c: string) => c !== category)
			: [...current, category]
		filterState = {
			...filterState,
			categories: updated,
		}
		onfilterchange?.(filterState)
	}

	const toggleCategoryGroup = (group: CategoryGroup) => {
		const groupNames = group.options.map((option) => option.fullName)
		if (groupNames.length === 0) return
		const allSelected = groupNames.every((name) =>
			filterState.categories.includes(name)
		)
		const updated = allSelected
			? filterState.categories.filter((name) => !groupNames.includes(name))
			: Array.from(new Set([...filterState.categories, ...groupNames]))
		filterState = {
			...filterState,
			categories: updated,
		}
		onfilterchange?.(filterState)
	}

	const clearCategoryGroup = (group: CategoryGroup) => {
		const groupNames = group.options.map((option) => option.fullName)
		if (groupNames.length === 0) return
		filterState = {
			...filterState,
			categories: filterState.categories.filter(
				(name) => !groupNames.includes(name)
			),
		}
		onfilterchange?.(filterState)
	}

	const clearCategoryFilter = () => {
		filterState = {
			...filterState,
			categories: [],
		}
		onfilterchange?.(filterState)
	}

	const selectAllCategories = () => {
		if (allSelectableCategoryNames.length === 0) return
		filterState = {
			...filterState,
			categories: allSelectableCategoryNames,
		}
		onfilterchange?.(filterState)
	}

	const compactActionBase = [
		'text-[10px]',
		'font-semibold',
		'tracking-wider',
		'rounded-full',
		'border',
		'px-2',
		'py-0.5',
		'transition-colors',
	]
	const compactActionAllActiveClass = 'border-primary/40 text-primary'
	const compactActionAllInactiveClass =
		'border-base-300 text-base-content/50 hover:text-base-content'
	const compactActionClearActiveClass =
		'border-base-300 text-base-content/70 hover:text-base-content'
	const compactActionClearInactiveClass = 'border-base-300 text-base-content/30'
</script>

<CollapsiblePanel open={openPanel === 'category'} class={className} {...rest}>
	<FilterPanelHeader
		title="Category"
		showClear={hasCategoryFilter}
		onclear={clearCategoryFilter}
	>
		{#snippet actions()}
			<button
				type="button"
				class={mergeClass(
					compactActionBase,
					allCategoriesSelected
						? compactActionAllActiveClass
						: compactActionAllInactiveClass
				)}
				onclick={selectAllCategories}
				disabled={allCategoriesSelected}
			>
				All
			</button>
		{/snippet}
	</FilterPanelHeader>

	<div class="flex flex-col gap-2">
		<FilterSearchInput
			placeholder="Search categories..."
			bind:value={categoryQuery}
		/>
		{#if categorySubGroups.length > 0}
			<div class="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
				{#each categorySubGroups as group (group.name)}
					{@const groupNames = group.options.map((option) => option.fullName)}
					{@const allSelected =
						groupNames.length > 0 &&
						groupNames.every((name) => filterState.categories.includes(name))}
					{@const anySelected = groupNames.some((name) =>
						filterState.categories.includes(name)
					)}
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between gap-2">
							<span
								class="text-[11px] font-semibold tracking-wider text-base-content/60 uppercase"
							>
								{group.name}
							</span>
							<div class="flex items-center gap-2">
								<button
									type="button"
									class={mergeClass(
										compactActionBase,
										allSelected
											? compactActionAllActiveClass
											: compactActionAllInactiveClass
									)}
									onclick={() => toggleCategoryGroup(group)}
								>
									All
								</button>
								<button
									type="button"
									class={mergeClass(
										compactActionBase,
										anySelected
											? compactActionClearActiveClass
											: compactActionClearInactiveClass
									)}
									onclick={() => clearCategoryGroup(group)}
									disabled={!anySelected}
								>
									Clear
								</button>
							</div>
						</div>
						<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
							{#each group.options as option (option.fullName)}
								<FilterOptionBadge
									active={filterState.categories.includes(option.fullName)}
									onclick={() => toggleCategory(option.fullName)}
								>
									{option.subcategory || option.displayName}
								</FilterOptionBadge>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-xs text-base-content/50">No categories found</p>
		{/if}
	</div>
</CollapsiblePanel>
