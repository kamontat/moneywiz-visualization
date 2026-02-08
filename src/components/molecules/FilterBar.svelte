<script lang="ts">
	import type { FilterState, TagFilter } from '$lib/analytics/filters/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransactionType } from '$lib/transactions/models'
	import Button from '$components/atoms/Button.svelte'
	import Select from '$components/atoms/Select.svelte'
	import { mergeClass } from '$lib/components'

	type TagCategory = {
		category: string
		tags: string[]
	}

	type Props = BaseProps &
		CustomProps<{
			filterState: FilterState
			availableTagCategories: TagCategory[]
			onfilterchange?: (state: FilterState) => void
		}>

	let {
		filterState = $bindable(),
		availableTagCategories = [],
		onfilterchange,
		class: className,
		...rest
	}: Props = $props()

	const transactionTypes: ParsedTransactionType[] = [
		'Expense',
		'Income',
		'Refund',
		'Transfer',
		'Debt',
		'DebtRepayment',
		'Windfall',
		'Giveaway',
		'Unknown',
	]

	const formatDate = (date: Date | undefined): string => {
		if (!date) return ''
		return date.toISOString().split('T')[0]
	}

	const parseDate = (value: string): Date | undefined => {
		if (!value) return undefined
		const date = new Date(value)
		return isNaN(date.getTime()) ? undefined : date
	}

	const handleStartDateChange = (e: Event) => {
		const input = e.target as HTMLInputElement
		filterState = {
			...filterState,
			dateRange: {
				...filterState.dateRange,
				start: parseDate(input.value),
			},
		}
		onfilterchange?.(filterState)
	}

	const handleEndDateChange = (e: Event) => {
		const input = e.target as HTMLInputElement
		filterState = {
			...filterState,
			dateRange: {
				...filterState.dateRange,
				end: parseDate(input.value),
			},
		}
		onfilterchange?.(filterState)
	}

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
					{ ...existing, values: [...existing.values, selectedTag] },
					...filterState.tags.slice(existingIndex + 1),
				]
			}
		} else {
			updatedTags = [
				...filterState.tags,
				{ category: categoryName, values: [selectedTag], mode: 'include' },
			]
		}

		filterState = { ...filterState, tags: updatedTags }
		onfilterchange?.(filterState)
	}

	const getSelectedTags = (categoryName: string): string[] => {
		const tagFilter = filterState.tags.find((t) => t.category === categoryName)
		return tagFilter?.values ?? []
	}

	const clearFilters = () => {
		filterState = {
			dateRange: { start: undefined, end: undefined },
			transactionTypes: [],
			tags: [],
		}
		onfilterchange?.(filterState)
	}

	const hasActiveFilters = $derived(
		filterState.dateRange.start !== undefined ||
			filterState.dateRange.end !== undefined ||
			filterState.transactionTypes.length > 0 ||
			filterState.tags.some((t) => t.values.length > 0)
	)
</script>

<div
	class={mergeClass(
		['rounded-box', 'bg-base-200/50', 'p-4', 'flex', 'flex-col', 'gap-4'],
		className
	)}
	{...rest}
>
	<div class="flex flex-wrap items-end gap-4">
		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium text-base-content/70" for="start-date">
				From
			</label>
			<input
				id="start-date"
				type="date"
				class="d-input-bordered d-input d-input-sm"
				value={formatDate(filterState.dateRange.start)}
				onchange={handleStartDateChange}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<label class="text-xs font-medium text-base-content/70" for="end-date">
				To
			</label>
			<input
				id="end-date"
				type="date"
				class="d-input-bordered d-input d-input-sm"
				value={formatDate(filterState.dateRange.end)}
				onchange={handleEndDateChange}
			/>
		</div>

		<div class="flex flex-col gap-1">
			<span class="text-xs font-medium text-base-content/70">Type</span>
			<div class="flex flex-wrap gap-1">
				{#each transactionTypes as type (type)}
					<button
						type="button"
						class={mergeClass(
							['d-badge', 'd-badge-sm', 'cursor-pointer', 'transition-all'],
							filterState.transactionTypes.includes(type)
								? 'd-badge-primary'
								: 'hover:d-badge-primary/50 d-badge-ghost'
						)}
						onclick={() => toggleTransactionType(type)}
					>
						{type}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if availableTagCategories.length > 0}
		<div class="flex flex-wrap items-end gap-4">
			{#each availableTagCategories as tagCategory (tagCategory.category)}
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-base-content/70">
						{tagCategory.category}
					</span>
					<div class="flex items-center gap-2">
						<Select
							values={['', ...tagCategory.tags]}
							value=""
							class="min-w-32 d-select-sm"
							onchange={(e) => {
								const select = e.target as HTMLSelectElement
								handleTagChange(tagCategory.category, select.value)
								select.value = ''
							}}
						/>
						{#if getSelectedTags(tagCategory.category).length > 0}
							<div class="flex flex-wrap gap-1">
								{#each getSelectedTags(tagCategory.category) as tag (tag)}
									<span class="d-badge gap-1 d-badge-sm d-badge-info">
										{tag}
										<button
											type="button"
											class="hover:text-error"
											onclick={() => handleTagChange(tagCategory.category, tag)}
										>
											×
										</button>
									</span>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if hasActiveFilters}
		<div class="flex justify-end">
			<Button variant="ghost" class="d-btn-sm" onclick={clearFilters}>
				Clear Filters
			</Button>
		</div>
	{/if}
</div>
