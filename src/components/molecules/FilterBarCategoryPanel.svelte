<script lang="ts">
	import type { FilterState as BaseFilterState } from '$lib/analytics/filters/models/state'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedCategory } from '$lib/transactions/models'
	import SearchIcon from '@iconify-svelte/lucide/search'
	import { SvelteMap } from 'svelte/reactivity'

	import { mergeClass } from '$lib/components'
	import { getCategoryFullName } from '$lib/transactions/utils'

	type FilterState = BaseFilterState & { categories: string[] }

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

{#if openPanel === 'category'}
	<div class={mergeClass(['flex', 'flex-col', 'gap-4'], className)} {...rest}>
		<div class="flex items-center justify-between">
			<span
				class="text-xs font-semibold tracking-wider text-base-content/70 uppercase"
			>
				Category
			</span>
			{#if hasCategoryFilter}
				<button
					type="button"
					class="text-xs text-base-content/60 transition-colors hover:text-base-content"
					onclick={clearCategoryFilter}
				>
					Clear
				</button>
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<label
				class="d-input-bordered d-input d-input-sm flex items-center gap-2"
			>
				<input
					type="text"
					class="grow"
					placeholder="Search categories..."
					bind:value={categoryQuery}
				/>
				<SearchIcon class="size-3 opacity-50" />
			</label>
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
											[
												'text-[10px]',
												'font-semibold',
												'tracking-wider',
												'uppercase',
												'rounded-full',
												'border',
												'px-2',
												'py-0.5',
												'transition-colors',
											],
											allSelected
												? 'border-primary/40 text-primary'
												: 'border-base-300 text-base-content/50 hover:text-base-content'
										)}
										onclick={() => toggleCategoryGroup(group)}
									>
										All
									</button>
									<button
										type="button"
										class={mergeClass(
											[
												'text-[10px]',
												'font-semibold',
												'tracking-wider',
												'uppercase',
												'rounded-full',
												'border',
												'px-2',
												'py-0.5',
												'transition-colors',
											],
											anySelected
												? 'border-base-300 text-base-content/70 hover:text-base-content'
												: 'border-base-300 text-base-content/30'
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
									<button
										type="button"
										class={mergeClass(
											tagOptionBase,
											filterState.categories.includes(option.fullName)
												? tagOptionIncludeClass
												: tagOptionInactiveClass
										)}
										onclick={() => toggleCategory(option.fullName)}
									>
										{option.subcategory || option.displayName}
									</button>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-xs text-base-content/50">No categories found</p>
			{/if}
		</div>
	</div>
{/if}
