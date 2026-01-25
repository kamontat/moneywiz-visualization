<script lang="ts">
	/**
	 * Donut chart showing income vs expense ratio
	 * Uses SVG for rendering without external dependencies
	 */
	import { formatTHB } from '$lib/finance';

	interface Props {
		income: number;
		expenses: number;
	}

	let { income, expenses }: Props = $props();

	// Calculate percentages (expenses stored as negative, so use absolute value)
	const absExpenses = $derived(Math.abs(expenses));
	const total = $derived(income + absExpenses);
	const incomePercent = $derived(total > 0 ? (income / total) * 100 : 50);
	const expensePercent = $derived(total > 0 ? (absExpenses / total) * 100 : 50);

	// SVG donut chart calculations
	const size = 140;
	const center = size / 2;
	const radius = 54;
	const strokeWidth = 20;

	// Calculate stroke dasharray for donut segments
	const circumference = 2 * Math.PI * radius;
	const incomeStroke = $derived((incomePercent / 100) * circumference);
	const expenseStroke = $derived((expensePercent / 100) * circumference);

	// Savings rate (income - expenses) / income
	const savingsRate = $derived(income > 0 ? ((income - absExpenses) / income) * 100 : 0);
</script>

<div class="flex items-center gap-6 p-2" role="img" aria-label="Income vs Expense ratio: {incomePercent.toFixed(0)}% income, {expensePercent.toFixed(0)}% expenses">
	<div class="relative flex-shrink-0">
		<svg
			width={size}
			height={size}
			viewBox="0 0 {size} {size}"
			aria-hidden="true"
		>
			<!-- Background circle -->
			<circle
				cx={center}
				cy={center}
				r={radius}
				fill="none"
				stroke="#f3f4f6"
				stroke-width={strokeWidth}
			/>
			{#if total > 0}
				<!-- Income arc (green) - starts from top -->
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke="url(#incomeGradient)"
					stroke-width={strokeWidth}
					stroke-dasharray="{incomeStroke} {circumference}"
					stroke-dashoffset="0"
					stroke-linecap="round"
					transform="rotate(-90 {center} {center})"
					class="transition-[stroke-dasharray,stroke-dashoffset] duration-600 ease-out"
				/>
				<!-- Expense arc (red) - continues after income -->
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					stroke="url(#expenseGradient)"
					stroke-width={strokeWidth}
					stroke-dasharray="{expenseStroke} {circumference}"
					stroke-dashoffset="-{incomeStroke}"
					stroke-linecap="round"
					transform="rotate(-90 {center} {center})"
					class="transition-[stroke-dasharray,stroke-dashoffset] duration-600 ease-out"
				/>
			{/if}
			<!-- Gradients -->
			<defs>
				<linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#34d399" />
					<stop offset="100%" stop-color="#10b981" />
				</linearGradient>
				<linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#f87171" />
					<stop offset="100%" stop-color="#ef4444" />
				</linearGradient>
			</defs>
		</svg>
		<!-- Center label -->
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center flex flex-col gap-0.5">
			<span class="text-xl font-bold {savingsRate >= 0 ? 'text-emerald-500' : 'text-red-600'}">
				{savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(0)}%
			</span>
			<span class="text-[0.7rem] text-gray-400 uppercase tracking-widest">Savings</span>
		</div>
	</div>

	<div class="flex flex-col gap-4">
		<div class="flex items-start gap-3">
			<span class="w-3 h-3 rounded-full mt-1 flex-shrink-0 bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_2px_4px_rgba(16,185,129,0.3)]"></span>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold text-mw-text-main">Income</span>
				<span class="text-sm font-bold text-gray-900">{formatTHB(income)}</span>
				<span class="text-xs text-mw-text-muted">{incomePercent.toFixed(0)}%</span>
			</div>
		</div>
		<div class="flex items-start gap-3">
			<span class="w-3 h-3 rounded-full mt-1 flex-shrink-0 bg-gradient-to-br from-red-400 to-red-500 shadow-[0_2px_4px_rgba(239,68,68,0.3)]"></span>
			<div class="flex flex-col gap-0.5">
				<span class="text-xs font-semibold text-mw-text-main">Expenses</span>
				<span class="text-sm font-bold text-gray-900">{formatTHB(absExpenses)}</span>
				<span class="text-xs text-mw-text-muted">{expensePercent.toFixed(0)}%</span>
			</div>
		</div>
	</div>
</div>
