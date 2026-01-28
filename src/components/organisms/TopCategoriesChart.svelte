<script lang="ts">
	import type { TopCategoriesData } from '$lib/analytics'

	let { data }: { data: TopCategoriesData } = $props()
</script>

<section
	aria-labelledby="cat-title"
	class="rounded-xl border border-mw-border bg-mw-surface p-3 shadow-sm"
>
	<h2 id="cat-title" class="mb-3 text-base font-normal text-mw-text-main">Top Categories</h2>
	{#if data.items.length > 0}
		<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Top categories by total amount">
			{#each data.items as item (item.name)}
				{@const barPercent = data.max ? (item.value / data.max) * 100 : 0}
				<li class="flex items-center gap-3">
					<span
						class="w-[180px] flex-shrink-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-mw-text-secondary"
						>{item.name}</span
					>
					<div class="h-3 flex-1 overflow-hidden rounded-md bg-gray-200">
						<div
							class="h-full min-w-[4px] rounded-md bg-mw-primary"
							style="width: {barPercent}%"
						></div>
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-mw-text-muted">No category data.</p>
	{/if}
</section>
