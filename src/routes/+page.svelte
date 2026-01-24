<script lang="ts">
	import { onMount } from 'svelte';
	import { csvStore, type CsvState } from '$lib/stores/csv';
	import { log } from '$lib/debug';
	import {
		getTHBRows,
		calculateTotals,
		calculateTopCategories,
		calculateDailyExpenses
	} from '$lib/analytics';
	import SummaryCards from '$components/SummaryCards.svelte';
	import TopCategoriesChart from '$components/TopCategoriesChart.svelte';
	import DailyExpensesChart from '$components/DailyExpensesChart.svelte';
	import IncomeExpenseRatioChart from '$components/IncomeExpenseRatioChart.svelte';

	let csv: CsvState = $state({ fileName: null, data: null });

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
</script>

<svelte:head>
	<title>MoneyWiz Visualization</title>
	<meta name="description" content="Visualize MoneyWiz CSV data: summaries and charts." />
</svelte:head>

<section aria-labelledby="dash-title" class="flex flex-col gap-4">
	<h1 id="dash-title" class="m-0 mb-2 text-2xl font-normal text-mw-text-main">Dashboard</h1>

	{#if csv.data}
		<SummaryCards {totals} />

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<section aria-labelledby="ratio-title" class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-sm">
				<h2 id="ratio-title" class="m-0 mb-3 text-base font-normal text-mw-text-main">Income vs Expenses</h2>
				<IncomeExpenseRatioChart income={totals.income} expenses={totals.expenses} />
			</section>
			<TopCategoriesChart data={topCategories} />
			<DailyExpensesChart data={dailyExpenses} />
		</div>
	{:else}
		<p class="text-mw-text-muted">No data loaded yet. Upload a CSV to begin.</p>
	{/if}
</section>

<!-- Keep a small blank canvas to satisfy existing tests and layout spacing -->
<section class="blank-canvas flex-none min-h-6" aria-hidden="true"></section>
