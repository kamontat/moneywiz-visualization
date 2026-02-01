<script lang="ts">
	import type { CategoryItem } from '$lib/analytics'
	import { formatTHB } from '$lib/finance'
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down'
	import ChevronUpIcon from '@iconify-svelte/lucide/chevron-up'

	interface Props {
		items: CategoryItem[]
		total: number
	}

	let { items, total }: Props = $props()

	let isOpen = $state(false)

	const absTotal = $derived(Math.abs(total))
</script>

<div
	class="border-mw-border bg-mw-surface ring-mw-primary/5 h-fit overflow-hidden rounded-xl border shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-offset-1"
>
	<button
		type="button"
		class="flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors outline-none select-none hover:bg-rose-50 active:bg-rose-100"
		onclick={() => (isOpen = !isOpen)}
		aria-expanded={isOpen}
		aria-controls="expense-breakdown"
	>
		<div class="flex flex-col">
			<span class="text-sm font-medium text-rose-900">Expenses by Category</span>
			<span class="text-lg font-bold text-rose-700">{formatTHB(total)}</span>
		</div>
		{#if isOpen}
			<ChevronUpIcon class="h-5 w-5 text-rose-600" aria-hidden="true" />
		{:else}
			<ChevronDownIcon class="h-5 w-5 text-rose-600" aria-hidden="true" />
		{/if}
	</button>
	{#if isOpen}
		<div
			id="expense-breakdown"
			class="animate-in slide-in-from-top-1 border-t border-rose-100 p-4 duration-200"
		>
			<ul class="m-0 flex list-none flex-col gap-3 p-0">
				{#each items as item (item.name)}
					{@const percent = absTotal > 0 ? (item.value / absTotal) * 100 : 0}
					<li class="flex items-center justify-between text-sm">
						<span class="text-mw-text-std truncate pr-4">{item.name}</span>
						<div class="flex flex-shrink-0 items-center gap-4">
							<!-- Display as negative since it's expense section -->
							<span class="text-mw-text-main font-medium text-rose-700"
								>{formatTHB(-item.value)}</span
							>
							<span class="text-mw-text-muted w-10 text-right text-xs">{percent.toFixed(1)}%</span>
						</div>
					</li>
				{/each}
				{#if items.length === 0}
					<li class="text-mw-text-muted text-sm italic">No expenses data</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
