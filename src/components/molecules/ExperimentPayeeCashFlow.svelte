<script lang="ts">
	import type {
		DebtMonthPoint,
		PayeeCashFlowEntry,
		WindfallGiveawayPoint,
	} from '$lib/analytics/transforms/models'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import ChartCanvas from '$components/atoms/ChartCanvas.svelte'
	import {
		barChartOptions,
		toDebtData,
		toPayeeDebtData,
		toPayeeWindfallData,
		toPayeeGiveawayData,
		toWindfallGiveawayData,
		zeroCenteredBarChartOptions,
	} from '$lib/charts'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			entries: PayeeCashFlowEntry[]
			variant: 'debt' | 'windfallGiveaway'
			monthlyPoints: DebtMonthPoint[] | WindfallGiveawayPoint[]
		}>

	let {
		entries,
		variant,
		monthlyPoints,
		class: className,
		...rest
	}: Props = $props()

	const hasDebt = $derived(
		entries.some((e) => e.debt > 0 || e.debtRepayment > 0)
	)
	const hasWindfallGiveaway = $derived(
		entries.some((e) => e.windfall > 0 || e.giveaway > 0)
	)

	const payeeChartData = $derived.by(() => {
		switch (variant) {
			case 'debt':
				return toPayeeDebtData(entries)
			case 'windfallGiveaway':
				return {
					labels: entries
						.filter((e) => e.windfall > 0 || e.giveaway > 0)
						.sort((a, b) => b.windfall + b.giveaway - (a.windfall + a.giveaway))
						.map((e) => e.payee),
					datasets: [
						...toPayeeWindfallData(entries).datasets,
						...toPayeeGiveawayData(entries).datasets,
					],
				}
		}
	})

	const hasData = $derived.by(() => {
		switch (variant) {
			case 'debt':
				return hasDebt
			case 'windfallGiveaway':
				return hasWindfallGiveaway
		}
	})

	const emptyMessage = $derived.by(() => {
		switch (variant) {
			case 'debt':
				return 'No debt or repayment transactions found'
			case 'windfallGiveaway':
				return 'No windfall or giveaway transactions found'
		}
	})

	const monthlyChartData = $derived.by(() => {
		switch (variant) {
			case 'debt':
				return toDebtData(monthlyPoints as DebtMonthPoint[])
			case 'windfallGiveaway':
				return toWindfallGiveawayData(monthlyPoints as WindfallGiveawayPoint[])
		}
	})

	const hasMonthlyData = $derived(monthlyPoints.length > 0)

	const payeeChartOptions = $derived(barChartOptions())
	const monthlyChartOptions = $derived(zeroCenteredBarChartOptions())
</script>

<div class={mergeClass(['flex', 'flex-col', 'gap-6'], className)} {...rest}>
	<div>
		<p
			class="mb-2 text-xs font-medium tracking-wide text-base-content/50 uppercase"
		>
			By Payee
		</p>
		{#if hasData}
			<ChartCanvas
				type="bar"
				data={payeeChartData}
				options={payeeChartOptions}
			/>
		{:else}
			<p class="py-8 text-center text-sm text-base-content/60">
				{emptyMessage}
			</p>
		{/if}
	</div>

	<div>
		<p
			class="mb-2 text-xs font-medium tracking-wide text-base-content/50 uppercase"
		>
			Monthly Breakdown
		</p>
		{#if hasMonthlyData}
			<ChartCanvas
				type="bar"
				data={monthlyChartData}
				options={monthlyChartOptions}
			/>
		{:else}
			<p class="py-8 text-center text-sm text-base-content/60">
				No monthly data available
			</p>
		{/if}
	</div>
</div>
