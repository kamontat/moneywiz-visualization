<script lang="ts">
	import { slide } from 'svelte/transition';
	import CalendarIcon from '@iconify-svelte/lucide/calendar';
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down';
	import { parseAllTags, type TagFilter } from '$lib/analytics';
	import DateFilterContent from '$components/molecules/filters/DateFilterContent.svelte';
	import TagCategoryContent from '$components/molecules/filters/TagCategoryContent.svelte';

	let {
		start = $bindable(null),
		end = $bindable(null),
		tagFilters = $bindable([]),
		rows = []
	}: {
		start: Date | null;
		end: Date | null;
		tagFilters: TagFilter[];
		rows: Record<string, string>[];
	} = $props();

	// Parse available tags
	const availableTags = $derived(parseAllTags(rows));
	const sortedCategories = $derived(Array.from(availableTags.keys()).sort());

	function getTagOptions(category: string): string[] {
		return Array.from(availableTags.get(category) || []).sort();
	}

	// State
	let activeFilter = $state<string | null>(null); // 'date' or category name

	function toggleFilter(filterName: string) {
		if (activeFilter === filterName) {
			activeFilter = null;
		} else {
			activeFilter = filterName;
		}
	}

	// Helpers to check active state for styling
	let isDateActive = $derived(start !== null || end !== null);

	function getActiveCount(cat: string) {
		const f = tagFilters.find((f) => f.category === cat);
		return f ? f.values.length : 0;
	}

	// Clear all
	let hasAnyFilter = $derived(isDateActive || tagFilters.some((f) => f.values.length > 0));

	function clearAll() {
		start = null;
		end = null;
		tagFilters = [];
		activeFilter = null;
	}
</script>

<div class="relative z-20 flex flex-col gap-2 print:hidden">
	<!-- Filter Bar (Buttons) -->
	<div class="custom-scrollbar no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
		<!-- Date Trigger -->
		<button
			onclick={() => toggleFilter('date')}
			class="group flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all
            {activeFilter === 'date'
				? 'border-mw-primary bg-mw-primary/10 text-mw-primary'
				: isDateActive
					? 'border-mw-primary/50 bg-mw-surface text-mw-primary'
					: 'border-mw-border bg-mw-surface text-mw-text-secondary hover:border-gray-300 hover:text-mw-text-main'}"
		>
			<CalendarIcon class="h-3.5 w-3.5" />
			<span>Date</span>
			{#if isDateActive}
				<span class="ml-1 h-1.5 w-1.5 rounded-full bg-mw-primary"></span>
			{/if}
			<ChevronDownIcon
				class="h-3 w-3 opacity-50 transition-transform {activeFilter === 'date'
					? 'rotate-180'
					: ''}"
			/>
		</button>

		<!-- Divider -->
		{#if sortedCategories.length > 0}
			<div class="mx-1 h-6 w-px flex-none bg-mw-border/50"></div>
		{/if}

		<!-- Category Triggers -->
		{#each sortedCategories as category (category)}
			{@const count = getActiveCount(category)}
			{@const isActive = count > 0}
			<button
				onclick={() => toggleFilter(category)}
				class="group flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all
                {activeFilter === category
					? 'border-mw-primary bg-mw-primary/10 text-mw-primary'
					: isActive
						? 'border-mw-primary/50 bg-mw-surface text-mw-primary'
						: 'border-mw-border bg-mw-surface text-mw-text-secondary hover:border-gray-300 hover:text-mw-text-main'}"
			>
				<span>{category}</span>
				{#if isActive}
					<span
						class="flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-mw-primary px-1 text-[9px] font-bold text-white"
					>
						{count}
					</span>
				{/if}
				<ChevronDownIcon
					class="h-3 w-3 opacity-50 transition-transform {activeFilter === category
						? 'rotate-180'
						: ''}"
				/>
			</button>
		{/each}

		<!-- Clear All -->
		{#if hasAnyFilter}
			<div class="ml-auto pl-2">
				<button
					onclick={clearAll}
					class="whitespace-nowrap text-xs text-mw-text-muted hover:text-red-500 hover:underline"
				>
					Clear All
				</button>
			</div>
		{/if}
	</div>

	<!-- Expanded Content -->
	{#if activeFilter}
		<div
			transition:slide={{ duration: 200, axis: 'y' }}
			class="overflow-hidden rounded-xl border border-mw-border bg-mw-surface shadow-sm"
		>
			{#if activeFilter === 'date'}
				<DateFilterContent bind:start bind:end />
			{:else}
				<TagCategoryContent
					category={activeFilter}
					availableValues={getTagOptions(activeFilter)}
					bind:tagFilters
				/>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Hide scrollbar for cleaner look but allow scrolling */
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}
	.no-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
