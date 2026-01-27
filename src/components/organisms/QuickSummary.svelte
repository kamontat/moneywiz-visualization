<script lang="ts">
	import type { Totals } from '$lib/analytics';
	import { formatTHB } from '$lib/finance';
	import Text from '$components/atoms/Text.svelte';

	let { totals }: { totals: Totals } = $props();

	// DRY up similar cards
	const cardClass =
		'bg-mw-surface border border-mw-border rounded-xl p-3 shadow-lg shadow-gray-900/5';
</script>

<div class="grid grid-cols-2 gap-3 md:grid-cols-4" role="list">
	<div class={cardClass} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase">Income</Text>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold">{formatTHB(totals.income)}</Text>
	</div>
	<div class={cardClass} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase">Expenses</Text>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold"
			>{formatTHB(Math.abs(totals.expenses))}</Text
		>
	</div>
	<div class={cardClass} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase">Net / Cash Flow</Text>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold">{formatTHB(totals.net)}</Text>
	</div>
	<div class={cardClass} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase">Saving Rate</Text>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold">{totals.savingRate.toFixed(1)}%</Text
		>
	</div>
</div>
