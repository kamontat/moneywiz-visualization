<script lang="ts">
	import type { Totals } from '$lib/analytics';
	import { formatTHB } from '$lib/finance';

	let { totals }: { totals: Totals } = $props();
</script>

<div class="cards" role="list">
	<div class="card" role="listitem">
		<p class="label">Income (THB)</p>
		<p class="value">{formatTHB(totals.income)}</p>
	</div>
	<div class="card" role="listitem">
		<p class="label">Expenses (THB)</p>
		<p class="value">{formatTHB(Math.abs(totals.expenses))}</p>
	</div>
	<div class="card" role="listitem">
		<p class="label">Net (THB)</p>
		<p class="value">{formatTHB(totals.net)}</p>
	</div>
	<div class="card" role="listitem">
		<p class="label">Transactions</p>
		<p class="value">{totals.count}</p>
	</div>
</div>

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.card {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 0.75rem;
		box-shadow: 0 10px 30px rgba(17, 24, 39, 0.06);
	}

	.label {
		margin: 0;
		color: #6b7280;
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.value {
		margin: 0.35rem 0 0;
		color: #1f2937;
		font-weight: 800;
		font-size: 1.1rem;
	}

	@media (max-width: 800px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
