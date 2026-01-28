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
</script>

<div
	class="h-fit overflow-hidden rounded-xl border border-mw-border bg-mw-surface shadow-sm ring-mw-primary/5 transition-shadow focus-within:ring-2 focus-within:ring-offset-1"
>
	<button
		type="button"
		class="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors outline-none select-none hover:bg-emerald-50 active:bg-emerald-100"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		aria-controls="income-breakdown"
	>
		<div class="flex flex-col">
			<span class="text-sm font-medium text-emerald-900">Income by Category</span>
			<span class="text-lg font-bold text-emerald-700">{formatTHB(total)}</span>
		</div>
		{#if isOpen}
			<ChevronUpIcon class="h-5 w-5 text-emerald-600" aria-hidden="true" />
		{:else}
			<ChevronDownIcon class="h-5 w-5 text-emerald-600" aria-hidden="true" />
		{/if}
	</button>
	{#if isOpen}
		<div
			id="income-breakdown"
			class="animate-in slide-in-from-top-1 border-t border-emerald-100 p-4 duration-200"
		>
			<ul class="m-0 flex list-none flex-col gap-3 p-0">
				{#each items as item (item.name)}
					{@const percent = total > 0 ? (item.value / total) * 100 : 0}
					<li class="flex items-center justify-between text-sm">
						<span class="text-mw-text-std truncate pr-4">{item.name}</span>
						<div class="flex flex-shrink-0 items-center gap-4">
							<span class="font-medium text-emerald-700 text-mw-text-main"
								>+{formatTHB(item.value)}</span
							>
							<span class="w-10 text-right text-xs text-mw-text-muted">{percent.toFixed(1)}%</span>
						</div>
					</li>
				{/each}
				{#if items.length === 0}
					<li class="text-sm text-mw-text-muted italic">No income data</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
