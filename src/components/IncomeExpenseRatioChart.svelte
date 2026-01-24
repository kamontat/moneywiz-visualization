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

<div class="ratio-chart" role="img" aria-label="Income vs Expense ratio: {incomePercent.toFixed(0)}% income, {expensePercent.toFixed(0)}% expenses">
	<div class="chart-container">
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
					class="donut-segment"
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
					class="donut-segment"
				/>
			{/if}
			<!-- Gradients -->
			<defs>
				<linearGradient id="incomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#10b981" />
					<stop offset="100%" stop-color="#059669" />
				</linearGradient>
				<linearGradient id="expenseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#f87171" />
					<stop offset="100%" stop-color="#ef4444" />
				</linearGradient>
			</defs>
		</svg>
		<!-- Center label -->
		<div class="center-label">
			<span class="savings-value" class:positive={savingsRate >= 0} class:negative={savingsRate < 0}>
				{savingsRate >= 0 ? '+' : ''}{savingsRate.toFixed(0)}%
			</span>
			<span class="savings-label">Savings</span>
		</div>
	</div>

	<div class="legend">
		<div class="legend-item">
			<span class="dot income"></span>
			<div class="legend-text">
				<span class="legend-label">Income</span>
				<span class="legend-value">{formatTHB(income)}</span>
				<span class="legend-percent">{incomePercent.toFixed(0)}%</span>
			</div>
		</div>
		<div class="legend-item">
			<span class="dot expense"></span>
			<div class="legend-text">
				<span class="legend-label">Expenses</span>
				<span class="legend-value">{formatTHB(absExpenses)}</span>
				<span class="legend-percent">{expensePercent.toFixed(0)}%</span>
			</div>
		</div>
	</div>
</div>

<style>
	.ratio-chart {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 0.5rem;
	}

	.chart-container {
		position: relative;
		flex-shrink: 0;
	}

	.donut-segment {
		transition: stroke-dasharray 0.6s ease-out, stroke-dashoffset 0.6s ease-out;
	}

	.center-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.savings-value {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.savings-value.positive {
		color: #059669;
	}

	.savings-value.negative {
		color: #dc2626;
	}

	.savings-label {
		font-size: 0.7rem;
		color: #9ca3af;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.legend-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-top: 0.2rem;
		flex-shrink: 0;
	}

	.dot.income {
		background: linear-gradient(135deg, #10b981, #059669);
		box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
	}

	.dot.expense {
		background: linear-gradient(135deg, #f87171, #ef4444);
		box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
	}

	.legend-text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.legend-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: #374151;
	}

	.legend-value {
		font-size: 0.9rem;
		font-weight: 700;
		color: #111827;
	}

	.legend-percent {
		font-size: 0.75rem;
		color: #9ca3af;
	}
</style>
