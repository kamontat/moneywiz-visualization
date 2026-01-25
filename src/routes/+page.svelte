<script lang="ts">
	import { onMount } from 'svelte';
	import { csvStore, type CsvState } from '$lib/stores/csv';
	import { log } from '$lib/debug';
	import {
		getTHBRows,
		calculateTotals,
		calculateTopCategories,
		calculateDailyExpenses,
		getDateRange
	} from '$lib/analytics';
	import SummaryCards from '$components/organisms/SummaryCards.svelte';
	import TopCategoriesChart from '$components/organisms/TopCategoriesChart.svelte';
	import DailyExpensesChart from '$components/organisms/DailyExpensesChart.svelte';
	import IncomeExpenseRatioChart from '$components/organisms/IncomeExpenseRatioChart.svelte';
	import DateRangeDisplay from '$components/atoms/DateRangeDisplay.svelte';

	let csv: CsvState = $state({ fileName: null, data: null });
	let activeTab = $state('overview');

	// Subscribe to global store
	onMount(() => {
		log.pageDashboard('mounting dashboard');
		const unsub = csvStore.subscribe((value) => {
			log.pageDashboard('store updated: fileName=%s', value.fileName);
			csv = value;
		});

		return () => {
			log.pageDashboard('unmounting dashboard');
			unsub();
		};
	});

	// Derived metrics using extracted business logic
	const thbRows = $derived(getTHBRows(csv.data));
	const totals = $derived(calculateTotals(thbRows));
	const topCategories = $derived(calculateTopCategories(thbRows));
	const dailyExpenses = $derived(calculateDailyExpenses(thbRows));
	const dateRange = $derived(getDateRange(thbRows));
</script>

<svelte:head>
	<title>MoneyWiz Visualization</title>
	<meta name="description" content="Visualize MoneyWiz CSV data: summaries and charts." />
</svelte:head>

<section aria-labelledby="dash-title" class="flex flex-col gap-6">
	{#if csv.data}
		<!-- Dashboard Header -->
		<header class="flex flex-col gap-1 py-1 pb-6">
			<!-- Title -->
			<h1 id="dash-title" class="m-0 text-3xl font-bold text-mw-text-main tracking-tight">Dashboard</h1>

			<!-- Date (Subtitle) -->
			{#if dateRange}
				<div>
					<DateRangeDisplay start={dateRange.start} end={dateRange.end} class="text-lg font-medium text-mw-text-secondary" />
				</div>
			{/if}

			<!-- Meta Info (Small + Gray + Unimportant) -->
			<div class="flex items-center gap-2 text-xs text-mw-text-muted/60 mt-1">
				<span class="font-mono">{csv.fileName}</span>
				<span class="opacity-40">|</span>
				<span>{(csv.data?.rows?.length ?? 0)} rows</span>
				<span class="opacity-40">|</span>
				<span>{(csv.data?.headers?.length ?? 0)} columns</span>
			</div>
		</header>

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
		</nav>

		<!-- Tab Content -->
		{#if activeTab === 'overview'}
			<div class="flex flex-col gap-6 animate-in fade-in duration-300 slide-in-from-bottom-2 pt-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<section aria-labelledby="ratio-title" class="bg-mw-surface border border-mw-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
						<h2 id="ratio-title" class="m-0 mb-4 text-lg font-semibold text-mw-text-main">Income vs Expenses</h2>
						<IncomeExpenseRatioChart income={totals.income} expenses={totals.expenses} />
					</section>
					<TopCategoriesChart data={topCategories} />
					<DailyExpensesChart data={dailyExpenses} />
				</div>
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
