<script lang="ts">
	import { onMount } from 'svelte';
	import { csvStore, type CsvState } from '$lib/stores/csv';
	import { parseCsv } from '$lib/csv';
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

	let csv: CsvState = $state({ fileName: null, data: null });

	// Subscribe to global store
	onMount(() => {
		log.pageDashboard('mounting dashboard');
		const unsub = csvStore.subscribe((value) => {
			log.pageDashboard('store updated: fileName=%s', value.fileName);
			csv = value;
		});

		// Load default sample CSV if none uploaded yet
		(async () => {
			if (!csv.data) {
				log.fetch('loading default CSV from /data/report.csv');
				try {
					const res = await fetch('/data/report.csv');
					if (res.ok) {
						const text = await res.text();
						log.fetch('default CSV loaded: %d bytes', text.length);
						const parsed = parseCsv(text);
						csvStore.set({ fileName: 'report.csv', data: parsed });
					} else {
						log.fetch('failed to load default CSV: status=%d', res.status);
					}
				} catch (err) {
					// Ignore fetch errors; dashboard will show empty state
					log.fetch('error loading default CSV: %O', err);
					console.error('Failed to load default CSV', err);
				}
			}
		})();

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
