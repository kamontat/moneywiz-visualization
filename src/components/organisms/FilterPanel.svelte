<script lang="ts">
	import { slide } from 'svelte/transition';
	import FilterIcon from '@iconify-svelte/lucide/filter';
	import XIcon from '@iconify-svelte/lucide/x';
	import CalendarIcon from '@iconify-svelte/lucide/calendar';

	let {
		start = $bindable(null),
		end = $bindable(null)
	}: {
		start: Date | null,
		end: Date | null
	} = $props();

	let isOpen = $state(false);

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
    let isActive = $derived(start !== null || end !== null);
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
			<span>Date</span>
			{#if isActive && !isOpen}
				<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-mw-primary/10 text-mw-primary">
                    Active
                </span>
			{/if}
		</button>

		{#if isActive}
			<button
				onclick={() => { start = null; end = null; }}
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
			<div class="p-4 bg-mw-surface border border-mw-border rounded-xl shadow-sm space-y-4">

				<!-- Date Inputs -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="start-date" class="text-xs font-semibold uppercase tracking-wider text-mw-text-muted">Start Date</label>
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
						<label for="end-date" class="text-xs font-semibold uppercase tracking-wider text-mw-text-muted">End Date</label>
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

				<!-- Divider -->
				<div class="h-px bg-mw-border/50"></div>

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
                        <div class="flex-grow"></div>
                        <button
							onclick={close}
							class="px-3 py-1.5 text-xs font-medium rounded-full text-mw-text-muted hover:bg-gray-100 transition-colors"
						>
							Close
						</button>
					</div>
				</div>

			</div>
		</div>
	{/if}
</div>
