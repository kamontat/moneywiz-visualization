<script lang="ts">
	import { slide } from 'svelte/transition';
	import FilterIcon from '@iconify-svelte/lucide/filter';
	import XIcon from '@iconify-svelte/lucide/x';
	import CalendarIcon from '@iconify-svelte/lucide/calendar';
	import CheckIcon from '@iconify-svelte/lucide/check';
    import { parseAllTags, type TagFilter } from '$lib/analytics';

	let {
		start = $bindable(null),
		end = $bindable(null),
        tagFilters = $bindable([]),
        rows = []
	}: {
		start: Date | null,
		end: Date | null,
        tagFilters: TagFilter[],
        rows: Record<string, string>[]
	} = $props();

	let isOpen = $state(false);

    // Parse available tags derived from rows
    const availableTags = $derived(parseAllTags(rows));
    const sortedCategories = $derived(Array.from(availableTags.keys()).sort());

    function getTagOptions(category: string): string[] {
        return Array.from(availableTags.get(category) || []).sort();
    }

    function getFilterForCategory(category: string): TagFilter | undefined {
        return tagFilters.find(f => f.category === category);
    }

    function updateFilter(category: string, value: string, modeOverride?: 'include' | 'exclude') {
        const existingIndex = tagFilters.findIndex(f => f.category === category);
        let filter = existingIndex >= 0 ? { ...tagFilters[existingIndex] } : { category, values: [], mode: 'include' as const };

        if (modeOverride) {
            filter.mode = modeOverride;
            // If switching mode, keep values? Yes.
        }

        // Toggle value if not mode override or if mode override is same (just update mode)
        if (!modeOverride) {
             if (filter.values.includes(value)) {
                filter.values = filter.values.filter(v => v !== value);
            } else {
                filter.values = [...filter.values, value];
            }
        }

        const newFilters = [...tagFilters];
        if (filter.values.length === 0) {
             if (existingIndex >= 0) {
                 newFilters.splice(existingIndex, 1);
             }
        } else {
             if (existingIndex >= 0) {
                 newFilters[existingIndex] = filter;
             } else {
                 newFilters.push(filter);
             }
        }
        tagFilters = newFilters;
    }

    function setMode(category: string, mode: 'include' | 'exclude') {
        const existingIndex = tagFilters.findIndex(f => f.category === category);
        if (existingIndex >= 0) {
            const newFilters = [...tagFilters];
            newFilters[existingIndex] = { ...newFilters[existingIndex], mode };
            tagFilters = newFilters;
        } else {
             // Create empty filter with mode? No, usually mode applies when values selected.
             // But maybe user wants to prepare mode first.
             // Let's just create it.
             // However, our logic cleans up empty filters.
             // So we just don't do anything if no values are selected yet,
             // OR we support empty structure in UI but cleaned in Store logic?
             // Let's handle it by only creating filter when values exist,
             // BUT we need to show the current mode in UI.
             // So UI needs to track mode even if not in filters list?
             // Or filters list can contain empty values?
             // filterByTags handles `values.length === 0` by skipping.
             // So we can push empty filter.
             const newFilters = [...tagFilters, { category, values: [], mode }];
             tagFilters = newFilters;
        }
    }

    function getMode(category: string): 'include' | 'exclude' {
        return getFilterForCategory(category)?.mode || 'include';
    }

    function isSelected(category: string, value: string): boolean {
        return getFilterForCategory(category)?.values.includes(value) || false;
    }

	// Toggles
	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}

	// Helpers for input binding
	function toIso(d: Date | null): string {
		if (!d) return '';
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	function fromIso(s: string): Date | null {
		if (!s) return null;
		const [y, m, d] = s.split('-').map(Number);
		return new Date(y, m - 1, d);
	}

	// Quick Actions
	const applyPreset = (preset: 'month' | 'last_month' | '30days' | 'year' | 'last_year' | 'all') => {
		const now = new Date();
		switch (preset) {
			case 'month':
				// Start of current month to today
				start = new Date(now.getFullYear(), now.getMonth(), 1);
				end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				break;
			case 'last_month':
				// Start of last month to end of last month
				start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
				// Day 0 of current month is the last day of previous month
				end = new Date(now.getFullYear(), now.getMonth(), 0);
				break;
			case '30days':
				start = new Date(now);
				start.setDate(now.getDate() - 30);
				end = new Date(now);
				break;
			case 'year':
				start = new Date(now.getFullYear(), 0, 1);
				end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				break;
			case 'last_year':
				start = new Date(now.getFullYear() - 1, 0, 1);
				end = new Date(now.getFullYear() - 1, 11, 31);
				break;
			case 'all':
				start = null;
				end = null;
				break;
		}
	};

	let startInput = $derived(toIso(start));
	let endInput = $derived(toIso(end));

    // Check if active
    let isActive = $derived(start !== null || end !== null || tagFilters.some(f => f.values.length > 0));
</script>

<div class="relative print:hidden">
	<!-- Header / Toggle -->
	<div class="flex items-center justify-end gap-3">
		<button
			onclick={toggle}
			class="group flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none
				{isActive ? 'text-mw-primary' : 'text-mw-text-secondary hover:text-mw-text-main'}"
			aria-expanded={isOpen}
			aria-controls="filter-panel"
		>
			<div class="flex items-center justify-center p-1.5 rounded-md bg-mw-surface border border-mw-border shadow-sm transition-all group-hover:border-gray-300 {isActive ? 'bg-mw-primary/10 border-mw-primary/20 text-mw-primary' : ''}">
				<FilterIcon class="w-4 h-4" />
			</div>
			<span>Filter</span>
			{#if isActive && !isOpen}
				<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-mw-primary/10 text-mw-primary">
                    Active
                </span>
			{/if}
		</button>

		{#if isActive}
			<button
				onclick={() => { start = null; end = null; tagFilters = []; }}
				class="text-xs text-mw-text-muted hover:text-red-500 hover:underline transition-colors whitespace-nowrap"
			>
				Clear Filter
			</button>
		{/if}
	</div>

	<!-- Collapsible Content -->
	{#if isOpen}
		<div
			id="filter-panel"
			transition:slide={{ duration: 200, axis: 'y' }}
			class="overflow-hidden mt-2 w-full"
		>
			<div class="p-4 bg-mw-surface border border-mw-border rounded-xl shadow-sm space-y-6">

				<!-- Date Inputs -->
				<section>
                    <h3 class="text-xs font-semibold uppercase tracking-wider text-mw-text-muted mb-3">Date Range</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-1.5">
                            <label for="start-date" class="text-xs text-mw-text-secondary">Start</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mw-text-muted">
                                    <CalendarIcon class="w-4 h-4" />
                                </div>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={startInput}
                                    onchange={(e) => start = fromIso(e.currentTarget.value)}
                                    class="block w-full pl-9 rounded-lg border-mw-border text-xs text-mw-text-main shadow-sm focus:border-mw-primary focus:ring-mw-primary"
                                />
                            </div>
                        </div>

                        <div class="flex flex-col gap-1.5">
                            <label for="end-date" class="text-xs text-mw-text-secondary">End</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-mw-text-muted">
                                    <CalendarIcon class="w-4 h-4" />
                                </div>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={endInput}
                                    onchange={(e) => end = fromIso(e.currentTarget.value)}
                                    class="block w-full pl-9 rounded-lg border-mw-border text-xs text-mw-text-main shadow-sm focus:border-mw-primary focus:ring-mw-primary"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Quick Buttons -->
                <div>
                    <span class="text-xs font-medium text-mw-text-muted mb-2 block">Quick Presets</span>
                    <div class="flex flex-wrap gap-2">
                        <button
                            onclick={() => applyPreset('month')}
                            class="px-3 py-1.5 text-xs font-medium rounded-full border border-mw-border bg-white text-mw-text-secondary hover:bg-gray-50 hover:text-mw-text-main transition-colors focus:ring-2 focus:ring-mw-primary/20"
                        >
                            This Month
                        </button>
                        <button
                            onclick={() => applyPreset('last_month')}
                            class="px-3 py-1.5 text-xs font-medium rounded-full border border-mw-border bg-white text-mw-text-secondary hover:bg-gray-50 hover:text-mw-text-main transition-colors focus:ring-2 focus:ring-mw-primary/20"
                        >
                            Last Month
                        </button>
                        <button
                            onclick={() => applyPreset('30days')}
                            class="px-3 py-1.5 text-xs font-medium rounded-full border border-mw-border bg-white text-mw-text-secondary hover:bg-gray-50 hover:text-mw-text-main transition-colors focus:ring-2 focus:ring-mw-primary/20"
                        >
                            Last 30 Days
                        </button>
                        <button
                            onclick={() => applyPreset('year')}
                            class="px-3 py-1.5 text-xs font-medium rounded-full border border-mw-border bg-white text-mw-text-secondary hover:bg-gray-50 hover:text-mw-text-main transition-colors focus:ring-2 focus:ring-mw-primary/20"
                        >
                            This Year
                        </button>
                        <button
                            onclick={() => applyPreset('last_year')}
                            class="px-3 py-1.5 text-xs font-medium rounded-full border border-mw-border bg-white text-mw-text-secondary hover:bg-gray-50 hover:text-mw-text-main transition-colors focus:ring-2 focus:ring-mw-primary/20"
                        >
                            Last Year
                        </button>
                    </div>
                </div>

                <!-- Divider -->
                <div class="h-px bg-mw-border/50"></div>

                <!-- Tag Filters -->
                {#if sortedCategories.length > 0}
                    <!-- Divider -->
                    <div class="h-px bg-mw-border/50"></div>

                    <section class="space-y-4">
                        <div class="flex items-center justify-between">
                             <h3 class="text-xs font-semibold uppercase tracking-wider text-mw-text-muted">Tags</h3>
                             {#if tagFilters.some(f => f.values.length > 0)}
                                <button onclick={() => tagFilters = []} class="text-xs text-mw-primary hover:underline">Clear Tags</button>
                             {/if}
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {#each sortedCategories as category}
                                <div class="flex flex-col gap-2 p-3 rounded-lg border border-mw-border bg-gray-50/50">
                                    <div class="flex items-center justify-between">
                                        <span class="text-xs font-bold text-mw-text-main truncate" title={category}>{category}</span>

                                        <!-- Mode Toggle -->
                                        <div class="flex bg-white rounded-md border border-mw-border p-0.5">
                                            <button
                                                onclick={() => setMode(category, 'include')}
                                                class="px-2 py-0.5 text-[10px] uppercase font-bold rounded transition-colors {getMode(category) === 'include' ? 'bg-mw-primary text-white' : 'text-mw-text-muted hover:bg-gray-100'}"
                                                title="Include selected"
                                            >
                                                Inc
                                            </button>
                                             <button
                                                onclick={() => setMode(category, 'exclude')}
                                                class="px-2 py-0.5 text-[10px] uppercase font-bold rounded transition-colors {getMode(category) === 'exclude' ? 'bg-red-500 text-white' : 'text-mw-text-muted hover:bg-gray-100'}"
                                                title="Exclude selected"
                                            >
                                                Exc
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Options -->
                                    <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                        {#each getTagOptions(category) as option}
                                            <button
                                                onclick={() => updateFilter(category, option)}
                                                class="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all text-left break-all
                                                    {isSelected(category, option)
                                                        ? (getMode(category) === 'include'
                                                            ? 'bg-mw-primary/10 border-mw-primary text-mw-primary font-medium'
                                                            : 'bg-red-50 border-red-200 text-red-600 font-medium line-through decoration-red-400')
                                                        : 'bg-white border-mw-border text-mw-text-secondary hover:border-gray-300'}"
                                            >
                                                {option}
                                                {#if isSelected(category, option)}
                                                     <XIcon class="w-3 h-3 opacity-50 flex-none" />
                                                {/if}
                                            </button>
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </section>
                {/if}

			</div>
		</div>
	{/if}
</div>
