<script lang="ts">
	import XIcon from '@iconify-svelte/lucide/x'
	import type { TagFilter } from '$lib/analytics'

	let {
		category,
		availableValues = [],
		tagFilters = $bindable(),
	}: {
		category: string
		availableValues: string[]
		tagFilters: TagFilter[]
	} = $props()

	// Derived current filter state
	let activeFilter = $derived(tagFilters.find((f) => f.category === category))

	// Explicitly derive mode and values to ensure reactivity
	let mode = $derived(activeFilter?.mode || 'include')
	let selectedValues = $derived(activeFilter?.values || [])

	function updateMode(newMode: 'include' | 'exclude') {
		const index = tagFilters.findIndex((f) => f.category === category)
		if (index >= 0) {
			const newFilters = [...tagFilters]
			newFilters[index] = { ...newFilters[index], mode: newMode }
			tagFilters = newFilters
		} else {
			// Initiate filter if it doesn't exist
			tagFilters = [...tagFilters, { category, values: [], mode: newMode }]
		}
	}

	function toggleValue(value: string) {
		const index = tagFilters.findIndex((f) => f.category === category)
		let currentValues = index >= 0 ? tagFilters[index].values : []
		let currentMode = index >= 0 ? tagFilters[index].mode : 'include'

		if (currentValues.includes(value)) {
			currentValues = currentValues.filter((v) => v !== value)
		} else {
			currentValues = [...currentValues, value]
		}

		const newFilters = [...tagFilters]
		if (currentValues.length === 0) {
			// Remove filter if empty values
			if (index >= 0) {
				newFilters.splice(index, 1)
			}
		} else {
			if (index >= 0) {
				newFilters[index] = { ...newFilters[index], values: currentValues }
			} else {
				newFilters.push({ category, values: currentValues, mode: currentMode })
			}
		}
		tagFilters = newFilters
	}
</script>

<div class="p-4">
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-mw-text-muted text-xs font-semibold tracking-wider uppercase">
			{category}
		</h3>

		<!-- Mode Switcher (Segmented Control) -->
		<div class="border-mw-border flex rounded-lg border bg-gray-50/50 p-1">
			<button
				onclick={() => updateMode('include')}
				class="relative rounded-md px-3 py-1 text-xs font-medium transition-all
                {mode === 'include'
					? 'text-mw-primary ring-mw-border bg-white shadow-sm ring-1'
					: 'text-mw-text-secondary hover:text-mw-text-main'}"
			>
				Include
			</button>
			<button
				onclick={() => updateMode('exclude')}
				class="relative rounded-md px-3 py-1 text-xs font-medium transition-all
                {mode === 'exclude'
					? 'ring-mw-border bg-white text-red-600 shadow-sm ring-1'
					: 'text-mw-text-secondary hover:text-mw-text-main'}"
			>
				Exclude
			</button>
		</div>
	</div>

	<!-- Options Grid -->
	<div
		class="custom-scrollbar grid max-h-60 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4"
	>
		{#each availableValues as option (option)}
			<button
				onclick={() => toggleValue(option)}
				class="group flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-xs transition-all
                {selectedValues.includes(option)
					? mode === 'include'
						? 'border-mw-primary bg-mw-primary/5 text-mw-primary'
						: 'border-red-200 bg-red-50 text-red-600 line-through decoration-red-400'
					: 'border-mw-border text-mw-text-secondary hover:text-mw-text-main bg-white hover:border-gray-300'}"
			>
				<span class="truncate" title={option}>{option}</span>
				{#if selectedValues.includes(option)}
					<XIcon class="h-3 w-3 flex-none opacity-50" />
				{/if}
			</button>
		{/each}
	</div>

	{#if selectedValues.length > 0}
		<div class="mt-4 flex justify-end">
			<button
				onclick={() => {
					const idx = tagFilters.findIndex((f) => f.category === category)
					if (idx >= 0) {
						const newFilters = [...tagFilters]
						newFilters.splice(idx, 1)
						tagFilters = newFilters
					}
				}}
				class="text-mw-text-muted text-xs hover:text-red-500 hover:underline"
			>
				Clear {category} Filter
			</button>
		</div>
	{/if}
</div>
