<script lang="ts">
	import { slide } from 'svelte/transition';
	import FilterIcon from '@iconify-svelte/lucide/filter';
	import XIcon from '@iconify-svelte/lucide/x';
	import CalendarIcon from '@iconify-svelte/lucide/calendar';
	import { parseAllTags, type TagFilter } from '$lib/analytics';

	let {
		start = $bindable(null),
		end = $bindable(null),
		tagFilters = $bindable([]),
		rows = [],
	}: {
		start: Date | null;
		end: Date | null;
		tagFilters: TagFilter[];
		rows: Record<string, string>[];
	} = $props();

	let isOpen = $state(false);

	// Parse available tags derived from rows
	const availableTags = $derived(parseAllTags(rows));
	const sortedCategories = $derived(Array.from(availableTags.keys()).sort());

	function getTagOptions(category: string): string[] {
		return Array.from(availableTags.get(category) || []).sort();
	}

	function getFilterForCategory(category: string): TagFilter | undefined {
		return tagFilters.find((f) => f.category === category);
	}

	function updateFilter(category: string, value: string, modeOverride?: 'include' | 'exclude') {
		const existingIndex = tagFilters.findIndex((f) => f.category === category);
		let filter =
			existingIndex >= 0
				? { ...tagFilters[existingIndex] }
				: { category, values: [], mode: 'include' as const };

		if (modeOverride) {
			filter.mode = modeOverride;
			// If switching mode, keep values? Yes.
		}

		// Toggle value if not mode override or if mode override is same (just update mode)
		if (!modeOverride) {
			if (filter.values.includes(value)) {
				filter.values = filter.values.filter((v) => v !== value);
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
		const existingIndex = tagFilters.findIndex((f) => f.category === category);
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
	const applyPreset = (
		preset: 'month' | 'last_month' | '30days' | 'year' | 'last_year' | 'all'
	) => {
		const now = new Date();
		switch (preset) {
			case 'month':
				// Start of current month to today
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
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
	let isActive = $derived(
		start !== null || end !== null || tagFilters.some((f) => f.values.length > 0)
	);
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
			<div
				class="flex items-center justify-center rounded-md border border-mw-border bg-mw-surface p-1.5 shadow-sm transition-all group-hover:border-gray-300 {isActive
					? 'border-mw-primary/20 bg-mw-primary/10 text-mw-primary'
					: ''}"
			>
				<FilterIcon class="h-4 w-4" />
			</div>
			<span>Filter</span>
			{#if isActive && !isOpen}
				<span
					class="inline-flex items-center rounded bg-mw-primary/10 px-2 py-0.5 text-xs font-semibold text-mw-primary"
				>
					Active
				</span>
			{/if}
		</button>

		{#if isActive}
			<button
				onclick={() => {
					start = null;
					end = null;
					tagFilters = [];
				}}
				class="text-xs whitespace-nowrap text-mw-text-muted transition-colors hover:text-red-500 hover:underline"
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
			class="mt-2 w-full overflow-hidden"
		>
			<div class="space-y-6 rounded-xl border border-mw-border bg-mw-surface p-4 shadow-sm">
				<!-- Date Inputs -->
				<section>
					<h3 class="mb-3 text-xs font-semibold tracking-wider text-mw-text-muted uppercase">
						Date Range
					</h3>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="flex flex-col gap-1.5">
							<label for="start-date" class="text-xs text-mw-text-secondary">Start</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-mw-text-muted"
								>
									<CalendarIcon class="h-4 w-4" />
								</div>
								<input
									id="start-date"
									type="date"
									value={startInput}
									onchange={(e) => (start = fromIso(e.currentTarget.value))}
									class="block w-full rounded-lg border-mw-border pl-9 text-xs text-mw-text-main shadow-sm focus:border-mw-primary focus:ring-mw-primary"
								/>
							</div>
						</div>

						<div class="flex flex-col gap-1.5">
							<label for="end-date" class="text-xs text-mw-text-secondary">End</label>
							<div class="relative">
								<div
									class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-mw-text-muted"
								>
									<CalendarIcon class="h-4 w-4" />
								</div>
								<input
									id="end-date"
									type="date"
									value={endInput}
									onchange={(e) => (end = fromIso(e.currentTarget.value))}
									class="block w-full rounded-lg border-mw-border pl-9 text-xs text-mw-text-main shadow-sm focus:border-mw-primary focus:ring-mw-primary"
								/>
							</div>
						</div>
					</div>
				</section>

				<!-- Quick Buttons -->
				<div>
					<span class="mb-2 block text-xs font-medium text-mw-text-muted">Quick Presets</span>
					<div class="flex flex-wrap gap-2">
						<button
							onclick={() => applyPreset('month')}
							class="rounded-full border border-mw-border bg-white px-3 py-1.5 text-xs font-medium text-mw-text-secondary transition-colors hover:bg-gray-50 hover:text-mw-text-main focus:ring-2 focus:ring-mw-primary/20"
						>
							This Month
						</button>
						<button
							onclick={() => applyPreset('last_month')}
							class="rounded-full border border-mw-border bg-white px-3 py-1.5 text-xs font-medium text-mw-text-secondary transition-colors hover:bg-gray-50 hover:text-mw-text-main focus:ring-2 focus:ring-mw-primary/20"
						>
							Last Month
						</button>
						<button
							onclick={() => applyPreset('30days')}
							class="rounded-full border border-mw-border bg-white px-3 py-1.5 text-xs font-medium text-mw-text-secondary transition-colors hover:bg-gray-50 hover:text-mw-text-main focus:ring-2 focus:ring-mw-primary/20"
						>
							Last 30 Days
						</button>
						<button
							onclick={() => applyPreset('year')}
							class="rounded-full border border-mw-border bg-white px-3 py-1.5 text-xs font-medium text-mw-text-secondary transition-colors hover:bg-gray-50 hover:text-mw-text-main focus:ring-2 focus:ring-mw-primary/20"
						>
							This Year
						</button>
						<button
							onclick={() => applyPreset('last_year')}
							class="rounded-full border border-mw-border bg-white px-3 py-1.5 text-xs font-medium text-mw-text-secondary transition-colors hover:bg-gray-50 hover:text-mw-text-main focus:ring-2 focus:ring-mw-primary/20"
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
							<h3 class="text-xs font-semibold tracking-wider text-mw-text-muted uppercase">
								Tags
							</h3>
							{#if tagFilters.some((f) => f.values.length > 0)}
								<button
									onclick={() => (tagFilters = [])}
									class="text-xs text-mw-primary hover:underline">Clear Tags</button
								>
							{/if}
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
							{#each sortedCategories as category (category)}
								<div
									class="flex flex-col gap-2 rounded-lg border border-mw-border bg-gray-50/50 p-3"
								>
									<div class="flex items-center justify-between">
										<span class="truncate text-xs font-bold text-mw-text-main" title={category}
											>{category}</span
										>

										<!-- Mode Toggle -->
										<div class="flex rounded-md border border-mw-border bg-white p-0.5">
											<button
												onclick={() => setMode(category, 'include')}
												class="rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors {getMode(
													category
												) === 'include'
													? 'bg-mw-primary text-white'
													: 'text-mw-text-muted hover:bg-gray-100'}"
												title="Include selected"
											>
												Inc
											</button>
											<button
												onclick={() => setMode(category, 'exclude')}
												class="rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors {getMode(
													category
												) === 'exclude'
													? 'bg-red-500 text-white'
													: 'text-mw-text-muted hover:bg-gray-100'}"
												title="Exclude selected"
											>
												Exc
											</button>
										</div>
									</div>

									<!-- Options -->
									<div
										class="custom-scrollbar flex max-h-32 flex-wrap gap-1.5 overflow-y-auto pr-1"
									>
										{#each getTagOptions(category) as option (option)}
											<button
												onclick={() => updateFilter(category, option)}
												class="inline-flex items-center gap-1 rounded border px-2 py-1 text-left text-xs break-all transition-all
                                                    {isSelected(category, option)
													? getMode(category) === 'include'
														? 'border-mw-primary bg-mw-primary/10 font-medium text-mw-primary'
														: 'border-red-200 bg-red-50 font-medium text-red-600 line-through decoration-red-400'
													: 'border-mw-border bg-white text-mw-text-secondary hover:border-gray-300'}"
											>
												{option}
												{#if isSelected(category, option)}
													<XIcon class="h-3 w-3 flex-none opacity-50" />
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
