<script lang="ts">
	import type { DailyExpensesData } from '$lib/analytics';

	let { data }: { data: DailyExpensesData } = $props();
</script>

<section aria-labelledby="daily-title" class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-sm">
	<h2 id="daily-title" class="text-mw-text-main text-base font-normal mb-3">Daily Expenses — {data.label}</h2>
	{#if data.items.length > 0}
		<svg
			class="w-full h-[180px]"
			viewBox="0 0 {data.items.length * 3} 100"
			preserveAspectRatio="none"
			aria-label="Daily expenses for current month"
		>
			{#each data.items as item, i}
				{@const barHeight = data.max ? (item.value / data.max) * 95 : 0}
				<rect x={i * 3} y={100 - barHeight} width="2" height={barHeight} class="fill-mw-primary"></rect>
			{/each}
		</svg>
	{:else}
		<p class="text-mw-text-muted">No daily data.</p>
	{/if}
</section>
