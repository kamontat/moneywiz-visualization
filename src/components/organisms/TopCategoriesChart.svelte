<script lang="ts">
	import type { TopCategoriesData } from '$lib/analytics';

	let { data }: { data: TopCategoriesData } = $props();
</script>

<section aria-labelledby="cat-title" class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-sm">
	<h2 id="cat-title" class="text-mw-text-main text-base font-normal mb-3">Top Categories</h2>
	{#if data.items.length > 0}
		<ul class="flex flex-col gap-2 m-0 p-0 list-none" aria-label="Top categories by total amount">
			{#each data.items as item (item.name)}
				{@const barPercent = data.max ? (item.value / data.max) * 100 : 0}
				<li class="flex items-center gap-3">
					<span class="flex-shrink-0 w-[180px] text-sm text-mw-text-secondary overflow-hidden text-ellipsis whitespace-nowrap">{item.name}</span>
					<div class="flex-1 h-3 bg-gray-200 rounded-md overflow-hidden">
						<div class="h-full bg-mw-primary rounded-md min-w-[4px]" style="width: {barPercent}%"></div>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-mw-text-muted">No category data.</p>
	{/if}
</section>
