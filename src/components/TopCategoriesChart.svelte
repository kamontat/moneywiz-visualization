<script lang="ts">
	import type { TopCategoriesData } from '$lib/analytics';

	let { data }: { data: TopCategoriesData } = $props();
</script>

<section aria-labelledby="cat-title" class="chart">
	<h2 id="cat-title">Top Categories</h2>
	{#if data.items.length > 0}
		<svg
			class="bar-chart"
			viewBox="0 0 100 {data.items.length * 16}"
			preserveAspectRatio="none"
			aria-label="Top categories by total amount"
		>
			{#each data.items as item, i}
				{@const barWidth = data.max ? (item.value / data.max) * 95 : 0}
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

	.bar-label {
		fill: #374151;
		font-size: 10px;
	}

	.empty {
		color: #6b7280;
	}
</style>
