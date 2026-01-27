<script lang="ts">
	import type { CategoryItem } from '$lib/analytics';
	import { formatTHB } from '$lib/finance';
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down';
	import ChevronUpIcon from '@iconify-svelte/lucide/chevron-up';

	interface Props {
		items: CategoryItem[];
		total: number;
	}

	let { items, total }: Props = $props();

	let isOpen = $state(false);

	const absTotal = $derived(Math.abs(total));
</script>

<div class="border border-mw-border rounded-xl overflow-hidden bg-mw-surface shadow-sm ring-mw-primary/5 focus-within:ring-2 focus-within:ring-offset-1 transition-shadow h-fit">
	<button
		type="button"
		class="w-full flex items-center justify-between p-4 bg-rose-50/50 hover:bg-rose-50 active:bg-rose-100 transition-colors text-left cursor-pointer select-none outline-none"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		aria-controls="expense-breakdown"
	>
		<div class="flex flex-col">
			<span class="text-sm font-medium text-rose-900">Expenses by Category</span>
			<span class="text-lg font-bold text-rose-700">{formatTHB(total)}</span>
		</div>
		{#if isOpen}
			<ChevronUpIcon class="w-5 h-5 text-rose-600" aria-hidden="true" />
		{:else}
			<ChevronDownIcon class="w-5 h-5 text-rose-600" aria-hidden="true" />
		{/if}
	</button>
	{#if isOpen}
		<div
			id="expense-breakdown"
			class="p-4 border-t border-rose-100 animate-in slide-in-from-top-1 duration-200"
		>
			<ul class="flex flex-col gap-3 m-0 p-0 list-none">
				{#each items as item}
					{@const percent = absTotal > 0 ? (item.value / absTotal) * 100 : 0}
					<li class="flex items-center justify-between text-sm">
						<span class="text-mw-text-std truncate pr-4">{item.name}</span>
						<div class="flex items-center gap-4 flex-shrink-0">
							<!-- Display as negative since it's expense section -->
							<span class="text-mw-text-main font-medium text-rose-700">{formatTHB(-item.value)}</span>
							<span class="text-xs text-mw-text-muted w-10 text-right">{percent.toFixed(1)}%</span>
						</div>
					</li>
				{/each}
				{#if items.length === 0}
					<li class="text-mw-text-muted italic text-sm">No expenses data</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
