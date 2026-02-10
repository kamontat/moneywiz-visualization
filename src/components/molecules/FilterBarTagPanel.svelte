<script lang="ts">
	import type {
		FilterState,
		TagCategory,
	} from '$components/molecules/models/filterBar'
	import type { TagFilter } from '$lib/analytics/filters/models/state'
	import type { FilterTagMode } from '$lib/analytics/filters/models/tags'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import CollapsiblePanel from '$components/atoms/CollapsiblePanel.svelte'
	import FilterOptionBadge from '$components/atoms/FilterOptionBadge.svelte'
	import FilterPanelHeader from '$components/atoms/FilterPanelHeader.svelte'
	import FilterSearchInput from '$components/atoms/FilterSearchInput.svelte'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			openPanel: string | null
			tagCategory: TagCategory
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		openPanel = null,
		tagCategory,
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	let tagQuery = $state('')

	const getTagFilter = (categoryName: string): TagFilter | undefined => {
		return filterState.tags.find((t) => t.category === categoryName)
	}

	const getSelectedTags = (categoryName: string): string[] => {
		return getTagFilter(categoryName)?.values ?? []
	}

	const getTagOptions = (currentTagCategory: TagCategory): string[] => {
		const query = tagQuery.trim().toLowerCase()
		const options = query
			? currentTagCategory.tags.filter((tag) =>
					tag.toLowerCase().includes(query)
				)
			: currentTagCategory.tags
		return options
	}

	const getTagMode = (categoryName: string): FilterTagMode => {
		return getTagFilter(categoryName)?.mode ?? 'include'
	}

	const handleTagChange = (categoryName: string, selectedTag: string) => {
		if (!selectedTag) return

		const existingIndex = filterState.tags.findIndex(
			(t) => t.category === categoryName
		)
		let updatedTags: TagFilter[]

		if (existingIndex >= 0) {
			const existing = filterState.tags[existingIndex]
			const hasTag = existing.values.includes(selectedTag)
			if (hasTag) {
				const newValues = existing.values.filter((v) => v !== selectedTag)
				if (newValues.length === 0) {
					updatedTags = filterState.tags.filter(
						(t) => t.category !== categoryName
					)
				} else {
					updatedTags = [
						...filterState.tags.slice(0, existingIndex),
						{ ...existing, values: newValues },
						...filterState.tags.slice(existingIndex + 1),
					]
				}
			} else {
				updatedTags = [
					...filterState.tags.slice(0, existingIndex),
					{
						...existing,
						values: [...existing.values, selectedTag],
					},
					...filterState.tags.slice(existingIndex + 1),
				]
			}
		} else {
			updatedTags = [
				...filterState.tags,
				{
					category: categoryName,
					values: [selectedTag],
					mode: 'include',
				},
			]
		}

		filterState = { ...filterState, tags: updatedTags }
		onfilterchange?.(filterState)
	}

	const toggleTagMode = (categoryName: string) => {
		const existingIndex = filterState.tags.findIndex(
			(t) => t.category === categoryName
		)
		if (existingIndex < 0) return

		const existing = filterState.tags[existingIndex]
		const newMode: FilterTagMode =
			existing.mode === 'include' ? 'exclude' : 'include'
		const updatedTags = [
			...filterState.tags.slice(0, existingIndex),
			{ ...existing, mode: newMode },
			...filterState.tags.slice(existingIndex + 1),
		]

		filterState = { ...filterState, tags: updatedTags }
		onfilterchange?.(filterState)
	}

	const clearTagCategory = (categoryName: string) => {
		filterState = {
			...filterState,
			tags: filterState.tags.filter((t) => t.category !== categoryName),
		}
		onfilterchange?.(filterState)
	}

	const selectedTags = $derived(getSelectedTags(tagCategory.category))
	const tagMode = $derived(getTagMode(tagCategory.category))
	const tagOptions = $derived(getTagOptions(tagCategory))
</script>

<CollapsiblePanel
	open={openPanel === tagCategory.category}
	class={className}
	{...rest}
>
	<FilterPanelHeader
		title={tagCategory.category}
		showClear={selectedTags.length > 0}
		onclear={() => clearTagCategory(tagCategory.category)}
	>
		{#snippet actions()}
			{#if selectedTags.length > 0}
				<div class="flex items-center gap-2">
					<span
						class={mergeClass(
							['text-[10px]', 'font-bold', 'tracking-wide', 'uppercase'],
							tagMode === 'include' ? 'text-success' : 'text-error'
						)}
					>
						{tagMode}
					</span>
					<input
						type="checkbox"
						class="d-toggle d-toggle-xs"
						class:d-toggle-success={tagMode === 'include'}
						class:d-toggle-error={tagMode === 'exclude'}
						class:text-success={tagMode === 'include'}
						class:text-error={tagMode === 'exclude'}
						checked={tagMode === 'include'}
						onclick={() => toggleTagMode(tagCategory.category)}
					/>
				</div>
			{/if}
		{/snippet}
	</FilterPanelHeader>

	<div class="flex flex-col gap-2">
		<FilterSearchInput
			placeholder={`Search ${tagCategory.category.toLowerCase()} tags...`}
			bind:value={tagQuery}
			onkeydown={(event) => {
				if (event.key !== 'Enter') return
				event.preventDefault()
				const nextOption = tagOptions.find(
					(option) => !selectedTags.includes(option)
				)
				if (!nextOption) return
				handleTagChange(tagCategory.category, nextOption)
				tagQuery = ''
			}}
		/>

		{#if tagOptions.length > 0}
			<div
				class="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				{#each tagOptions as option (option)}
					{@const isSelected = selectedTags.includes(option)}
					<FilterOptionBadge
						variant={tagMode}
						active={isSelected}
						onclick={() => {
							handleTagChange(tagCategory.category, option)
							tagQuery = ''
						}}
					>
						{option}
					</FilterOptionBadge>
				{/each}
			</div>
		{:else}
			<p class="text-xs text-base-content/50">No tags match your search</p>
		{/if}
	</div>
</CollapsiblePanel>
