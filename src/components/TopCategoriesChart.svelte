<script lang="ts">
	import type { TopCategoriesData } from '$lib/analytics';

	let { data }: { data: TopCategoriesData } = $props();
</script>

<section aria-labelledby="cat-title" class="chart">
	<h2 id="cat-title">Top Categories</h2>
	{#if data.items.length > 0}
		<ul class="bar-list" aria-label="Top categories by total amount">
			{#each data.items as item (item.name)}
				{@const barPercent = data.max ? (item.value / data.max) * 100 : 0}
				<li class="bar-item">
					<span class="bar-label">{item.name}</span>
					<div class="bar-track">
						<div class="bar" style="width: {barPercent}%"></div>
					</div>
				</li>
			{/each}
		</ul>
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

	.bar-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.bar-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.bar-label {
		flex-shrink: 0;
		width: 180px;
		font-size: 0.875rem;
		color: #374151;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar-track {
		flex: 1;
		height: 12px;
		background: #e5e7eb;
		border-radius: 6px;
		overflow: hidden;
	}

	.bar {
		height: 100%;
		background: #10a164;
		border-radius: 6px;
		min-width: 4px;
	}

	.empty {
		color: #6b7280;
	}
</style>
