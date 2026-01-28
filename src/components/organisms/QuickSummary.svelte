<script lang="ts">
	import type { Totals } from '$lib/analytics';
	import { formatTHB } from '$lib/finance';
	import Text from '$components/atoms/Text.svelte';

	let { totals }: { totals: Totals } = $props();

	type Variant = 'green' | 'red' | 'blue' | 'purple';

	const getStyles = (variant: Variant) => {
		const base = 'border rounded-xl p-3 shadow-lg shadow-gray-900/5';
		switch (variant) {
			case 'green':
				return {
					container: `${base} bg-green-50 border-green-200`,
					text: 'text-green-800',
					label: 'text-green-700',
				};
			case 'red':
				return {
					container: `${base} bg-red-50 border-red-200`,
					text: 'text-red-800',
					label: 'text-red-700',
				};
			case 'blue':
				return {
					container: `${base} bg-blue-50 border-blue-200`,
					text: 'text-blue-800',
					label: 'text-blue-700',
				};
			case 'purple':
				return {
					container: `${base} bg-purple-50 border-purple-200`,
					text: 'text-purple-800',
					label: 'text-purple-700',
				};
		}
	};

	const incomeStyle = getStyles('green');
	const expenseStyle = getStyles('red');
	const netStyle = getStyles('blue');
	const savingStyle = getStyles('purple');
</script>

<div class="grid grid-cols-2 gap-3 md:grid-cols-4" role="list">
	<div class={incomeStyle.container} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase {incomeStyle.label}">Income</Text
		>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold {incomeStyle.text}"
			>{formatTHB(totals.income)}</Text
		>
	</div>
	<div class={expenseStyle.container} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase {expenseStyle.label}"
			>Expenses</Text
		>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold {expenseStyle.text}"
			>{formatTHB(Math.abs(totals.expenses))}</Text
		>
	</div>
	<div class={netStyle.container} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase {netStyle.label}"
			>Net / Cash Flow</Text
		>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold {netStyle.text}"
			>{formatTHB(totals.net)}</Text
		>
	</div>
	<div class={savingStyle.container} role="listitem">
		<Text variant="small" class="font-bold tracking-wide uppercase {savingStyle.label}"
			>Saving Rate</Text
		>
		<Text variant="body" class="mt-1.5 text-lg font-extrabold {savingStyle.text}"
			>{totals.savingRate.toFixed(1)}%</Text
		>
	</div>
</div>
