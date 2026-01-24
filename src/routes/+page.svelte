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

<section aria-labelledby="dash-title" class="dashboard">
	<h1 id="dash-title">Dashboard</h1>

	{#if csv.data}
		<SummaryCards {totals} />

		<div class="charts">
			<section aria-labelledby="ratio-title" class="chart-panel">
				<h2 id="ratio-title">Income vs Expenses</h2>
				<IncomeExpenseRatioChart income={totals.income} expenses={totals.expenses} />
			</section>
			<TopCategoriesChart data={topCategories} />
			<DailyExpensesChart data={dailyExpenses} />
		</div>
	{:else}
		<p class="empty">No data loaded yet. Upload a CSV to begin.</p>
	{/if}
</section>

<!-- Keep a small blank canvas to satisfy existing tests and layout spacing -->
<section class="blank-canvas" aria-hidden="true"></section>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	h1 {
		margin: 0 0 0.5rem 0;
		font-size: 1.4rem;
		color: #111827;
	}

	.charts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.chart-panel {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 0.75rem;
	}

	.chart-panel h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: #111827;
	}

	.empty {
		color: #6b7280;
	}

	.blank-canvas {
		flex: 0;
		min-height: 24px;
	}

	@media (max-width: 800px) {
		.charts {
			grid-template-columns: 1fr;
		}
	}
</style>
