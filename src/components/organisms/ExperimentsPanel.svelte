<script lang="ts">
	import type { ParsedTransaction } from '$lib/types'
	import type { BaseProps, CustomProps } from '$lib/ui/models'
	import { onMount } from 'svelte'

	import Panel from '$components/atoms/Panel.svelte'
	import ExperimentCategoryBubble from '$components/molecules/ExperimentCategoryBubble.svelte'
	import ExperimentCategoryVolatility from '$components/molecules/ExperimentCategoryVolatility.svelte'
	import ExperimentOutlierTimeline from '$components/molecules/ExperimentOutlierTimeline.svelte'
	import ExperimentRefundImpact from '$components/molecules/ExperimentRefundImpact.svelte'
	import ExperimentRegimeTimeline from '$components/molecules/ExperimentRegimeTimeline.svelte'
	import ExperimentSavingsTarget from '$components/molecules/ExperimentSavingsTarget.svelte'
	import { buildExperimentsPanelData } from '$lib/app/dashboard'
	import { mergeClass } from '$lib/ui'

	type Props = BaseProps &
		CustomProps<{
			transactions: ParsedTransaction[]
		}>

	const targetStorageKey = 'moneywiz:experiments:savings-target-monthly:v1'

	let { transactions, class: className, ...rest }: Props = $props()
	let monthlyTarget = $state(0)
	let hydrated = $state(false)

	const panelData = $derived(
		buildExperimentsPanelData(transactions, monthlyTarget)
	)
	const volatility = $derived(panelData.volatility)
	const bubbles = $derived(panelData.bubbles)
	const refundImpact = $derived(panelData.refundImpact)
	const regimes = $derived(panelData.regimes)
	const outliers = $derived(panelData.outliers)
	const savings = $derived(panelData.savings)

	const defaultTarget = $derived.by(() => {
		const nets = savings.map((point) => point.net)
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
	<Panel title="1) Category Volatility">
		<p class="mb-3 text-sm text-base-content/70">
			Compares average spend vs variability to surface unstable categories.
		</p>
		<ExperimentCategoryVolatility points={volatility} />
	</Panel>

	<Panel title="2) Category Bubble">
		<p class="mb-3 text-sm text-base-content/70">
			Highlights transaction frequency, total spend, and average ticket size.
		</p>
		<ExperimentCategoryBubble points={bubbles} />
	</Panel>

	<Panel title="3) Savings vs Target">
		<p class="mb-3 text-sm text-base-content/70">
			Compares cumulative savings against your editable monthly target line.
		</p>
		<ExperimentSavingsTarget
			points={savings}
			target={monthlyTarget}
			ontargetchange={updateTarget}
		/>
	</Panel>

	<Panel title="4) Refund Impact">
		<p class="mb-3 text-sm text-base-content/70">
			Shows how refunds change gross expenses into net expenses.
		</p>
		<ExperimentRefundImpact points={refundImpact} />
	</Panel>

	<Panel title="5) Regime Timeline">
		<p class="mb-3 text-sm text-base-content/70">
			Classifies each month as stable, stressed, or deficit.
		</p>
		<ExperimentRegimeTimeline segments={regimes} />
	</Panel>

	<Panel title="6) Outlier Timeline">
		<p class="mb-3 text-sm text-base-content/70">
			Marks unusually large days against a rolling baseline.
		</p>
		<ExperimentOutlierTimeline points={outliers} />
	</Panel>
</div>
