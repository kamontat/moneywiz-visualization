<script lang="ts">
	import type { DailyExpensesData } from '$lib/analytics';

	let { data }: { data: DailyExpensesData } = $props();
</script>

<section aria-labelledby="daily-title" class="chart">
	<h2 id="daily-title">Daily Expenses — {data.label}</h2>
	{#if data.items.length > 0}
		<svg
			class="bar-chart"
			viewBox="0 0 {data.items.length * 3} 100"
			preserveAspectRatio="none"
			aria-label="Daily expenses for current month"
		>
			{#each data.items as item, i}
				{@const barHeight = data.max ? (item.value / data.max) * 95 : 0}
				<rect x={i * 3} y={100 - barHeight} width="2" height={barHeight} class="bar"></rect>
			{/each}
		</svg>
	{:else}
		<p class="empty">No daily data.</p>
	{/if}
</section>

<style>
	.chart {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 0.75rem;
	}

	.bar-chart {
		width: 100%;
		height: 180px;
	}

	.bar {
		fill: #10a164;
	}

	.empty {
		color: #6b7280;
	}
</style>
