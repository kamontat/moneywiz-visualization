<script lang="ts">
	import { onMount } from 'svelte';
	import { csvStore, type CsvState } from '$lib/stores/csv';
	import { parseCsv, type ParsedCsv } from '$lib/csv';

	let csv: CsvState = $state({ fileName: null, data: null });

	// Subscribe to global store
	onMount(() => {
		const unsub = csvStore.subscribe((value) => {
			csv = value;
		});

		// Load default sample CSV if none uploaded yet
		(async () => {
			if (!csv.data) {
				try {
					const res = await fetch('/data/report.csv');
					if (res.ok) {
						const text = await res.text();
						const parsed = parseCsv(text);
						csvStore.set({ fileName: 'report.csv', data: parsed });
					}
				} catch (err) {
					// Ignore fetch errors; dashboard will show empty state
					console.error('Failed to load default CSV', err);
				}
			}
		})();

		return () => unsub();
	});

	// Helpers
	function parseAmountTHB(value: string): number {
		// Remove thousands separators and spaces
		const cleaned = value.replace(/[,\s]/g, '');
		const num = Number(cleaned);
		return isNaN(num) ? 0 : num;
	}

	function parseDateDDMMYYYY(value: string): Date | null {
		const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (!m) return null;
		const [_, dd, mm, yyyy] = m;
		// Construct date at local midnight
		return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
	}

	function getTHBRows(data: ParsedCsv | null): Record<string, string>[] {
		if (!data) return [];
		return data.rows.filter((r) => (r['Currency'] || '').toUpperCase() === 'THB');
	}

	// Derived metrics
	const thbRows = $derived(getTHBRows(csv.data));

	const totals = $derived(() => {
		let income = 0;
		let expenses = 0;
		for (const r of thbRows) {
			const amt = parseAmountTHB(r['Amount'] || '0');
			if (amt >= 0) income += amt;
			else expenses += amt; // negative
		}
		const net = income + expenses;
		return { income, expenses, net, count: thbRows.length };
	});

	const topCategories = $derived(() => {
		const sums: Record<string, number> = {};
		for (const r of thbRows) {
			const cat = r['Category'] || 'Uncategorized';
			const amt = parseAmountTHB(r['Amount'] || '0');
			const absAmt = Math.abs(amt);
			sums[cat] = (sums[cat] || 0) + absAmt;
		}
		const items = Object.entries(sums)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([name, value]) => ({ name, value }));
		const max = items.reduce((m, it) => Math.max(m, it.value), 0);
		return { items, max };
	});

	const dailyExpenses = $derived(() => {
		// Find latest date in THB rows
		const dates = thbRows
			.map((r) => parseDateDDMMYYYY(r['Date'] || ''))
			.filter((d): d is Date => d instanceof Date);
		if (dates.length === 0) return { items: [], max: 0, label: '' };

		const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
		const month = latest.getMonth();
		const year = latest.getFullYear();

		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const perDay: number[] = Array.from({ length: daysInMonth }, () => 0);

		for (const r of thbRows) {
			const d = parseDateDDMMYYYY(r['Date'] || '');
			if (!d || d.getMonth() !== month || d.getFullYear() !== year) continue;
			const amt = parseAmountTHB(r['Amount'] || '0');
			if (amt < 0) {
				const dayIdx = d.getDate() - 1;
				perDay[dayIdx] += Math.abs(amt);
			}
		}

		const max = perDay.reduce((m, v) => Math.max(m, v), 0);
		const items = perDay.map((v, i) => ({ day: i + 1, value: v }));
		const label = `${latest.toLocaleString(undefined, { month: 'long' })} ${year}`;
		return { items, max, label };
	});

	function formatTHB(n: number): string {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency: 'THB',
			maximumFractionDigits: 2
		}).format(n);
	}
</script>

<svelte:head>
	<title>MoneyWiz Visualization</title>
	<meta name="description" content="Visualize MoneyWiz CSV data: summaries and charts." />
</svelte:head>

<section aria-labelledby="dash-title" class="dashboard">
	<h1 id="dash-title">Dashboard</h1>

	{#if csv.data}
		<div class="cards" role="list">
			<div class="card" role="listitem">
				<p class="label">Income (THB)</p>
				<p class="value">{formatTHB(totals.income)}</p>
			</div>
			<div class="card" role="listitem">
				<p class="label">Expenses (THB)</p>
				<p class="value">{formatTHB(Math.abs(totals.expenses))}</p>
			</div>
			<div class="card" role="listitem">
				<p class="label">Net (THB)</p>
				<p class="value">{formatTHB(totals.net)}</p>
			</div>
			<div class="card" role="listitem">
				<p class="label">Transactions</p>
				<p class="value">{totals.count}</p>
			</div>
		</div>

		<div class="charts">
			<section aria-labelledby="cat-title" class="chart">
				<h2 id="cat-title">Top Categories</h2>
				{#if topCategories.items.length > 0}
					<svg class="bar-chart" viewBox="0 0 100 {topCategories.items.length * 16}" preserveAspectRatio="none" aria-label="Top categories by total amount">
						{#each topCategories.items as item, i}
							{@const barWidth = topCategories.max ? (item.value / topCategories.max) * 95 : 0}
							<g transform={`translate(0, ${i * 16})`}>
								<text x="0" y="12" class="bar-label">{item.name}</text>
								<rect x="35" y="4" width={barWidth} height="8" rx="2" class="bar"></rect>
							</g>
						{/each}
					</svg>
				{:else}
					<p class="empty">No category data.</p>
				{/if}
			</section>

			<section aria-labelledby="daily-title" class="chart">
				<h2 id="daily-title">Daily Expenses — {dailyExpenses.label}</h2>
				{#if dailyExpenses.items.length > 0}
					<svg class="bar-chart" viewBox="0 0 {dailyExpenses.items.length * 3} 100" preserveAspectRatio="none" aria-label="Daily expenses for current month">
						{#each dailyExpenses.items as item, i}
							{@const barHeight = dailyExpenses.max ? (item.value / dailyExpenses.max) * 95 : 0}
							<rect x={i * 3} y={100 - barHeight} width="2" height={barHeight} class="bar"></rect>
						{/each}
					</svg>
				{:else}
					<p class="empty">No daily data.</p>
				{/if}
			</section>
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

	.cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 0.75rem;
		box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
	}

	.label {
		margin: 0;
		color: #6b7280;
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.value {
		margin: 0.35rem 0 0;
		color: #1f2937;
		font-weight: 800;
		font-size: 1.1rem;
	}

	.charts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.chart {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 0.75rem;
	}

	.bar-chart { width: 100%; height: 180px; }
	.bar { fill: #10a164; }
	.bar-label { fill: #374151; font-size: 10px; }

	.empty { color: #6b7280; }

	.blank-canvas {
		flex: 0;
		min-height: 24px;
	}

	@media (max-width: 800px) {
		.cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.charts { grid-template-columns: 1fr; }
	}
</style>
