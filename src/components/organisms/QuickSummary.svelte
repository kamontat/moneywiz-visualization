<script lang="ts">
    import type { Totals } from '$lib/analytics';
    import { formatTHB } from '$lib/finance';
    import Text from '$components/atoms/Text.svelte';

    let { totals }: { totals: Totals } = $props();

    // DRY up similar cards
    const cardClass = "bg-mw-surface border border-mw-border rounded-xl p-3 shadow-lg shadow-gray-900/5";
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-3" role="list">
    <div class={cardClass} role="listitem">
        <Text variant="small" class="font-bold uppercase tracking-wide">Income</Text>
        <Text variant="body" class="mt-1.5 font-extrabold text-lg">{formatTHB(totals.income)}</Text>
    </div>
    <div class={cardClass} role="listitem">
        <Text variant="small" class="font-bold uppercase tracking-wide">Expenses</Text>
        <Text variant="body" class="mt-1.5 font-extrabold text-lg">{formatTHB(Math.abs(totals.expenses))}</Text>
    </div>
    <div class={cardClass} role="listitem">
        <Text variant="small" class="font-bold uppercase tracking-wide">Net / Cash Flow</Text>
        <Text variant="body" class="mt-1.5 font-extrabold text-lg">{formatTHB(totals.net)}</Text>
    </div>
    <div class={cardClass} role="listitem">
        <Text variant="small" class="font-bold uppercase tracking-wide">Saving Rate</Text>
        <Text variant="body" class="mt-1.5 font-extrabold text-lg">{totals.savingRate.toFixed(1)}%</Text>
    </div>
</div>
