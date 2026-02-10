<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import type { ParsedTransaction } from '$lib/transactions/models'
	import { onMount } from 'svelte'

	import Panel from '$components/atoms/Panel.svelte'
	import ExperimentCalendarHeatmap from '$components/molecules/ExperimentCalendarHeatmap.svelte'
	import ExperimentCategoryBubble from '$components/molecules/ExperimentCategoryBubble.svelte'
	import ExperimentCategoryVolatility from '$components/molecules/ExperimentCategoryVolatility.svelte'
	import ExperimentMonthlyWaterfall from '$components/molecules/ExperimentMonthlyWaterfall.svelte'
	import ExperimentOutlierTimeline from '$components/molecules/ExperimentOutlierTimeline.svelte'
	import ExperimentRefundImpact from '$components/molecules/ExperimentRefundImpact.svelte'
	import ExperimentRegimeTimeline from '$components/molecules/ExperimentRegimeTimeline.svelte'
	import ExperimentSavingsTarget from '$components/molecules/ExperimentSavingsTarget.svelte'
	import {
		byCalendarHeatmap,
		byCategoryBubble,
		byCategoryVolatility,
		byCumulativeSavings,
		byMonthlyWaterfall,
		byOutlierTimeline,
		byRefundImpact,
		byRegimeTimeline,
		transform,
	} from '$lib/analytics/transforms'
	import { mergeClass } from '$lib/components'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	const targetStorageKey = 'moneywiz:experiments:savings-target-monthly:v1'

	let { transactions, class: className, ...rest }: Props = $props()
	let monthlyTarget = $state(0)
	let hydrated = $state(false)

	const waterfall = $derived(transform(transactions, byMonthlyWaterfall))
	const heatmap = $derived(transform(transactions, byCalendarHeatmap))
	const volatility = $derived(transform(transactions, byCategoryVolatility))
	const bubbles = $derived(transform(transactions, byCategoryBubble))
	const refundImpact = $derived(transform(transactions, byRefundImpact))
	const regimes = $derived(transform(transactions, byRegimeTimeline))
	const outliers = $derived(transform(transactions, byOutlierTimeline))
	const savings = $derived(
		transform(transactions, byCumulativeSavings(monthlyTarget))
	)

	const defaultTarget = $derived.by(() => {
		const nets = waterfall.map((point) => point.net)
		if (nets.length === 0) return 0
		const sample = nets
			.slice(-6)
			.slice()
			.sort((a, b) => a - b)
		const middle = Math.floor(sample.length / 2)
		if (sample.length % 2 === 1) return sample[middle]
		return (sample[middle - 1] + sample[middle]) / 2
	})

	const persist = (value: number) => {
		if (typeof window === 'undefined') return
		window.localStorage.setItem(targetStorageKey, String(value))
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const saved = window.localStorage.getItem(targetStorageKey)
			if (saved !== null) {
				const parsed = Number(saved)
				if (!Number.isNaN(parsed)) monthlyTarget = parsed
			}
		}

		hydrated = true
	})

	$effect(() => {
		if (!hydrated) return
		if (monthlyTarget === 0 && defaultTarget !== 0) {
			monthlyTarget = defaultTarget
			persist(defaultTarget)
		}
	})

	const updateTarget = (target: number) => {
		monthlyTarget = target
		persist(target)
	}
</script>

<div
	class={mergeClass(
		['grid', 'grid-cols-1', 'gap-6', '2xl:grid-cols-2'],
		className
	)}
	{...rest}
>
	<Panel title="1) Monthly Waterfall">
		<p class="mb-3 text-sm text-base-content/70">
			Breaks monthly deltas into income, spending, debt, and buy/sell impact.
		</p>
		<ExperimentMonthlyWaterfall steps={waterfall} />
	</Panel>

	<Panel title="2) Calendar Heatmap">
		<p class="mb-3 text-sm text-base-content/70">
			Shows daily net flow intensity to reveal streaks and spikes.
		</p>
		<ExperimentCalendarHeatmap cells={heatmap} />
	</Panel>

	<Panel title="3) Category Volatility">
		<p class="mb-3 text-sm text-base-content/70">
			Compares average spend vs variability to surface unstable categories.
		</p>
		<ExperimentCategoryVolatility points={volatility} />
	</Panel>

	<Panel title="4) Category Bubble">
		<p class="mb-3 text-sm text-base-content/70">
			Highlights transaction frequency, total spend, and average ticket size.
		</p>
		<ExperimentCategoryBubble points={bubbles} />
	</Panel>

	<Panel title="5) Savings vs Target">
		<p class="mb-3 text-sm text-base-content/70">
			Compares cumulative savings against your editable monthly target line.
		</p>
		<ExperimentSavingsTarget
			points={savings}
			target={monthlyTarget}
			ontargetchange={updateTarget}
		/>
	</Panel>

	<Panel title="6) Refund Impact">
		<p class="mb-3 text-sm text-base-content/70">
			Shows how refunds change gross expenses into net expenses.
		</p>
		<ExperimentRefundImpact points={refundImpact} />
	</Panel>

	<Panel title="7) Regime Timeline">
		<p class="mb-3 text-sm text-base-content/70">
			Classifies each month as stable, stressed, or deficit.
		</p>
		<ExperimentRegimeTimeline segments={regimes} />
	</Panel>

	<Panel title="8) Outlier Timeline">
		<p class="mb-3 text-sm text-base-content/70">
			Marks unusually large days against a rolling baseline.
		</p>
		<ExperimentOutlierTimeline points={outliers} />
	</Panel>
</div>
