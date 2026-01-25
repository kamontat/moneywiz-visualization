<script lang="ts">
	import type { CategoryBreakdown, Totals } from '$lib/analytics';
	import { formatTHB } from '$lib/finance';
	import ChevronDownIcon from '@iconify-svelte/lucide/chevron-down';
	import ChevronUpIcon from '@iconify-svelte/lucide/chevron-up';

	interface Props {
		breakdown: CategoryBreakdown;
		totals: Totals;
	}

	let { breakdown, totals }: Props = $props();

	let isIncomeOpen = $state(false);
	let isExpensesOpen = $state(false);

	const incomeTotal = $derived(totals.income);
	const expenseTotal = $derived(Math.abs(totals.expenses));
</script>

<div class="flex flex-col gap-4">
	<!-- Income Panel -->
	<div class="border border-mw-border rounded-xl overflow-hidden bg-mw-surface shadow-sm ring-mw-primary/5 focus-within:ring-2 focus-within:ring-offset-1 transition-shadow">
		<button
			type="button"
			class="w-full flex items-center justify-between p-4 bg-emerald-50/50 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-left cursor-pointer select-none outline-none"
			onclick={() => (isIncomeOpen = !isIncomeOpen)}
			aria-expanded={isIncomeOpen}
			aria-controls="income-breakdown"
		>
			<div class="flex flex-col">
				<span class="text-sm font-medium text-emerald-900">Income by Category</span>
				<span class="text-lg font-bold text-emerald-700">{formatTHB(totals.income)}</span>
			</div>
			{#if isIncomeOpen}
				<ChevronUpIcon class="w-5 h-5 text-emerald-600" aria-hidden="true" />
			{:else}
				<ChevronDownIcon class="w-5 h-5 text-emerald-600" aria-hidden="true" />
			{/if}
		</button>
		{#if isIncomeOpen}
			<div
				id="income-breakdown"
				class="p-4 border-t border-emerald-100 animate-in slide-in-from-top-1 duration-200"
			>
				<ul class="flex flex-col gap-3 m-0 p-0 list-none">
					{#each breakdown.income as item}
						{@const percent = incomeTotal > 0 ? (item.value / incomeTotal) * 100 : 0}
						<li class="flex items-center justify-between text-sm">
							<span class="text-mw-text-std truncate pr-4">{item.name}</span>
							<div class="flex items-center gap-4 flex-shrink-0">
								<span class="text-mw-text-main font-medium text-emerald-700">+{formatTHB(item.value)}</span>
								<span class="text-xs text-mw-text-muted w-10 text-right">{percent.toFixed(1)}%</span>
							</div>
						</li>
					{/each}
					{#if breakdown.income.length === 0}
						<li class="text-mw-text-muted italic text-sm">No income data</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>

	<!-- Expense Panel -->
	<div class="border border-mw-border rounded-xl overflow-hidden bg-mw-surface shadow-sm ring-mw-primary/5 focus-within:ring-2 focus-within:ring-offset-1 transition-shadow">
		<button
			type="button"
			class="w-full flex items-center justify-between p-4 bg-rose-50/50 hover:bg-rose-50 active:bg-rose-100 transition-colors text-left cursor-pointer select-none outline-none"
			onclick={() => (isExpensesOpen = !isExpensesOpen)}
			aria-expanded={isExpensesOpen}
			aria-controls="expense-breakdown"
		>
			<div class="flex flex-col">
				<span class="text-sm font-medium text-rose-900">Expenses by Category</span>
				<span class="text-lg font-bold text-rose-700">{formatTHB(totals.expenses)}</span>
			</div>
			{#if isExpensesOpen}
				<ChevronUpIcon class="w-5 h-5 text-rose-600" aria-hidden="true" />
			{:else}
				<ChevronDownIcon class="w-5 h-5 text-rose-600" aria-hidden="true" />
			{/if}
		</button>
		{#if isExpensesOpen}
			<div
				id="expense-breakdown"
				class="p-4 border-t border-rose-100 animate-in slide-in-from-top-1 duration-200"
			>
				<ul class="flex flex-col gap-3 m-0 p-0 list-none">
					{#each breakdown.expenses as item}
						{@const percent = expenseTotal > 0 ? (item.value / expenseTotal) * 100 : 0}
						<li class="flex items-center justify-between text-sm">
							<span class="text-mw-text-std truncate pr-4">{item.name}</span>
							<div class="flex items-center gap-4 flex-shrink-0">
								<!-- Display as negative since it's expense section -->
								<span class="text-mw-text-main font-medium text-rose-700">{formatTHB(-item.value)}</span>
								<span class="text-xs text-mw-text-muted w-10 text-right">{percent.toFixed(1)}%</span>
							</div>
						</li>
					{/each}
					{#if breakdown.expenses.length === 0}
						<li class="text-mw-text-muted italic text-sm">No expenses data</li>
					{/if}
				</ul>
			</div>
		{/if}
	</div>
</div>
