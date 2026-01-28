<script lang="ts">
	import CalendarIcon from '@iconify-svelte/lucide/calendar';

	let {
		start = $bindable(null),
		end = $bindable(null)
	}: {
		start: Date | null;
		end: Date | null;
	} = $props();

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

	const applyPreset = (
		preset: 'month' | 'last_month' | '30days' | 'year' | 'last_year' | 'all'
	) => {
		const now = new Date();
		switch (preset) {
			case 'month':
				// eslint-disable-next-line svelte/prefer-svelte-reactivity
				start = new Date(now.getFullYear(), now.getMonth(), 1);
				end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				break;
			case 'last_month':
				start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
</script>

<div class="flex flex-col gap-6 p-4">
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

	<!-- Divider -->
	<div class="h-px bg-mw-border/50"></div>

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
			<button
				onclick={() => applyPreset('all')}
				class="rounded-full border border-mw-border bg-white px-3 py-1.5 text-xs font-medium text-mw-text-secondary transition-colors hover:bg-gray-50 hover:text-mw-text-main focus:ring-2 focus:ring-mw-primary/20"
			>
				All Time
			</button>
		</div>
	</div>
</div>
