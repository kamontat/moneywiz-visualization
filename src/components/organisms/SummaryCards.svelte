<script lang="ts">
	import type { Totals } from '$lib/analytics';
	import { formatTHB } from '$lib/finance';

	let { totals }: { totals: Totals } = $props();
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-3" role="list">
	<div class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-lg shadow-gray-900/5" role="listitem">
		<p class="m-0 text-mw-text-muted font-bold text-xs uppercase tracking-wide">Income (THB)</p>
		<p class="mt-1.5 m-0 text-mw-text-main font-extrabold text-lg">{formatTHB(totals.income)}</p>
	</div>
	<div class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-lg shadow-gray-900/5" role="listitem">
		<p class="m-0 text-mw-text-muted font-bold text-xs uppercase tracking-wide">Expenses (THB)</p>
		<p class="mt-1.5 m-0 text-mw-text-main font-extrabold text-lg">{formatTHB(Math.abs(totals.expenses))}</p>
	</div>
	<div class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-lg shadow-gray-900/5" role="listitem">
		<p class="m-0 text-mw-text-muted font-bold text-xs uppercase tracking-wide">Net (THB)</p>
		<p class="mt-1.5 m-0 text-mw-text-main font-extrabold text-lg">{formatTHB(totals.net)}</p>
	</div>
	<div class="bg-mw-surface border border-mw-border rounded-xl p-3 shadow-lg shadow-gray-900/5" role="listitem">
		<p class="m-0 text-mw-text-muted font-bold text-xs uppercase tracking-wide">Transactions</p>
		<p class="mt-1.5 m-0 text-mw-text-main font-extrabold text-lg">{totals.count}</p>
	</div>
</div>
