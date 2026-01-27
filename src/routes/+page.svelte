<script lang="ts">
	import { onMount } from 'svelte';
	import { csvStore, type CsvState } from '$lib/stores/csv';
	import { log } from '$lib/debug';
	import {
		getTHBRows,
		calculateTotals,
		calculateTopCategories,
		calculateCategoryBreakdown,
		calculateIncomeExpenseTimeSeries,
		getDateRange,
		filterByDateRange,
		filterByTags,
		type TagFilter,
	} from '$lib/analytics';

	import Dashboard from '$components/organisms/Dashboard.svelte';

	let csv = $state<CsvState>({
		data: null,
		fileName: null,
		tagFilters: [],
	});

	// Filter State
	let filterStart: Date | null = $state(null);
	let filterEnd: Date | null = $state(null);
	let tagFilters = $state<TagFilter[]>([]);

	// Subscribe to global store
	onMount(() => {
		log.pageDashboard('mounting dashboard');
		const unsub = csvStore.subscribe((value) => {
			const next = { ...value, tagFilters: value.tagFilters ?? [] };
			log.pageDashboard('store updated: fileName=%s', next.fileName);
			csv = next;

			// Store -> Local Sync (keep tag filters defined)
			if (JSON.stringify(tagFilters) !== JSON.stringify(next.tagFilters)) {
				tagFilters = next.tagFilters;
			}
		});

		return () => {
			log.pageDashboard('unmounting dashboard');
			unsub();
		};
	});

	// Local -> Store Sync
	$effect(() => {
		// Only push to store if local state differs from derived store state
		if (JSON.stringify(tagFilters) !== JSON.stringify(csv.tagFilters ?? [])) {
			csvStore.setTagFilters(tagFilters);
		}
	});

	// Derived metrics using extracted business logic
	const thbRows = $derived(getTHBRows(csv.data));
	const dateFilteredRows = $derived(filterByDateRange(thbRows, filterStart, filterEnd));
	const filteredRows = $derived(filterByTags(dateFilteredRows, tagFilters));

	const totals = $derived(calculateTotals(filteredRows));
	const topCategories = $derived(calculateTopCategories(filteredRows));
	const tsData = $derived(calculateIncomeExpenseTimeSeries(filteredRows, filterStart, filterEnd));
	const breakdown = $derived(calculateCategoryBreakdown(filteredRows));
	const dateRange = $derived(getDateRange(filteredRows));
</script>

<svelte:head>
	<title>MoneyWiz Visualization</title>
	<meta name="description" content="Visualize MoneyWiz CSV data: summaries and charts." />
</svelte:head>

<!-- We use the Dashboard Organism to handle layout when data is present -->
<!-- Note: Error states are handled in layout or via toasts, here we handle empty vs loaded -->
{#if csv.data}
	<Dashboard
		csvFileName={csv.fileName}
		{dateRange}
		rowCount={csv.data.rows?.length ?? 0}
		filteredCount={filteredRows.length}
		thbCount={thbRows.length}
		bind:filterStart
		bind:filterEnd
		bind:tagFilters
		{thbRows}
		{totals}
		{breakdown}
		{tsData}
		{topCategories}
		previewData={{ headers: csv.data.headers, rows: filteredRows }}
	/>
{:else}
	<div
		class="flex flex-col items-center justify-center rounded-xl border border-dashed border-mw-border bg-mw-surface p-12 text-center"
	>
		<h1 class="mb-2 text-2xl font-bold text-mw-text-main">Welcome to MoneyWiz Report</h1>
		<p class="max-w-md text-mw-text-muted">
			Upload a CSV export from MoneyWiz to visualize your financial data instantly. Your data stays
			on your device.
		</p>
	</div>
{/if}

<!-- Keep a small blank canvas to satisfy existing tests and layout spacing -->
<section class="blank-canvas min-h-6 flex-none" aria-hidden="true"></section>

<!-- Keep a small blank canvas to satisfy existing tests and layout spacing -->
<section class="blank-canvas min-h-6 flex-none" aria-hidden="true"></section>
