<script lang="ts">
	import type { TopCategoriesData } from '$lib/analytics'

	let { data }: { data: TopCategoriesData } = $props()
</script>

<section
	aria-labelledby="cat-title"
	class="border-mw-border bg-mw-surface rounded-xl border p-3 shadow-sm"
>
	<h2 id="cat-title" class="text-mw-text-main mb-3 text-base font-normal">Top Categories</h2>
	{#if data.items.length > 0}
		<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Top categories by total amount">
			{#each data.items as item (item.name)}
				{@const barPercent = data.max ? (item.value / data.max) * 100 : 0}
				<li class="flex items-center gap-3">
					<span
						class="text-mw-text-secondary w-[180px] flex-shrink-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap"
						>{item.name}</span
					>
					<div class="h-3 flex-1 overflow-hidden rounded-md bg-gray-200">
						<div
							class="bg-mw-primary h-full min-w-[4px] rounded-md"
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
