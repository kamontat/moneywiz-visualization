<script lang="ts">
	import { onMount } from 'svelte';
	import { csvStore, type CsvState } from '$lib/stores/csv';
	import { log } from '$lib/debug';
	import {
		getTHBRows,
		calculateTotals,
		calculateTopCategories,
		calculateDailyExpenses,
		calculateCategoryBreakdown,
		getDateRange,
		filterByDateRange,
		filterByTags,
		type TagFilter
	} from '$lib/analytics';
	import FilterPanel from '$components/organisms/FilterPanel.svelte';
	import SummaryCards from '$components/organisms/SummaryCards.svelte';
	import TopCategoriesChart from '$components/organisms/TopCategoriesChart.svelte';
	import DailyExpensesChart from '$components/organisms/DailyExpensesChart.svelte';
	import IncomeExpenseRatioChart from '$components/organisms/IncomeExpenseRatioChart.svelte';
	import CategoryBreakdown from '$components/organisms/CategoryBreakdown.svelte';
	import DataPreviewPanel from '$components/organisms/DataPreviewPanel.svelte';
	import DateRangeDisplay from '$components/atoms/DateRangeDisplay.svelte';

	let csv = $state<CsvState>({
		data: null,
		fileName: null,
		tagFilters: []
	});
	let activeTab = $state('overview');

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
	const dailyExpenses = $derived(calculateDailyExpenses(filteredRows));
	const breakdown = $derived(calculateCategoryBreakdown(filteredRows));
	const dateRange = $derived(getDateRange(filteredRows));
</script>

<svelte:head>
	<title>MoneyWiz Visualization</title>
	<meta name="description" content="Visualize MoneyWiz CSV data: summaries and charts." />
</svelte:head>

<section aria-labelledby="dash-title" class="flex flex-col gap-4">
	{#if csv.data}
		<!-- Dashboard Header -->
		<header class="flex flex-col gap-1 py-1">
			<h1 id="dash-title" class="m-0 text-3xl font-bold text-mw-text-main tracking-tight">{csv.fileName || 'Dashboard'}</h1>

			<!-- Meta Info -->
			<div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-mw-text-muted mt-1 animate-in fade-in duration-300">
				{#if dateRange}
					<DateRangeDisplay start={dateRange.start} end={dateRange.end} class="" />
					<span class="opacity-40">|</span>
				{/if}

				<span>{(csv.data?.rows?.length ?? 0)} rows total</span>

				{#if filteredRows.length !== thbRows.length}
					<span class="opacity-40">|</span>
					<span class="text-mw-primary font-medium">{filteredRows.length} shown</span>
				{/if}
			</div>
		</header>

		<!-- Filter Panel -->
		<section aria-label="Filters" class="z-20">
			<FilterPanel
				bind:start={filterStart}
				bind:end={filterEnd}
				bind:tagFilters={tagFilters}
				rows={thbRows}
			/>
		</section>

		<!-- Quick Summary Section -->
		<section aria-label="Quick Summary" class="flex flex-col gap-2">
			<SummaryCards {totals} />
		</section>

		<!-- Tabs -->
		<nav class="flex border-b border-mw-border mt-4" aria-label="Dashboard views">
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'overview' ? 'border-mw-primary text-mw-primary' : 'border-transparent text-mw-text-muted hover:text-mw-text-secondary hover:border-gray-300'}"
				onclick={() => activeTab = 'overview'}
				aria-current={activeTab === 'overview' ? 'page' : undefined}
			>
				Overview
			</button>
			<button
				type="button"
				class="px-4 py-2 text-sm font-medium border-b-2 transition-colors {activeTab === 'preview' ? 'border-mw-primary text-mw-primary' : 'border-transparent text-mw-text-muted hover:text-mw-text-secondary hover:border-gray-300'}"
				onclick={() => activeTab = 'preview'}
				aria-current={activeTab === 'preview' ? 'page' : undefined}
			>
				Preview
			</button>
		</nav>

		<!-- Tab Content -->
		{#if activeTab === 'overview'}
			<div class="flex flex-col gap-4 animate-in fade-in duration-300 slide-in-from-bottom-2 pt-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<section aria-labelledby="ratio-title" class="bg-mw-surface border border-mw-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
						<h2 id="ratio-title" class="m-0 mb-4 text-lg font-semibold text-mw-text-main">Income vs Expenses</h2>
						<IncomeExpenseRatioChart income={totals.income} expenses={totals.expenses} />
					</section>
					<TopCategoriesChart data={topCategories} />
					<DailyExpensesChart data={dailyExpenses} />
					<CategoryBreakdown {breakdown} {totals} />
				</div>
			</div>
		{:else if activeTab === 'preview'}
			<div class="flex flex-col gap-4 animate-in fade-in duration-300 slide-in-from-bottom-2 pt-4">
				<DataPreviewPanel data={csv.data} />
			</div>
		{/if}
	{:else}
		<div class="flex flex-col items-center justify-center p-12 text-center bg-mw-surface border border-mw-border border-dashed rounded-xl">
			<h1 class="text-2xl font-bold text-mw-text-main mb-2">Welcome to MoneyWiz Report</h1>
			<p class="text-mw-text-muted max-w-md">Upload a CSV export from MoneyWiz to visualize your financial data instantly. Your data stays on your device.</p>
		</div>
	{/if}
</section>

<!-- Keep a small blank canvas to satisfy existing tests and layout spacing -->
<section class="blank-canvas flex-none min-h-6" aria-hidden="true"></section>
