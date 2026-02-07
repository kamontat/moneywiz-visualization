<script lang="ts">
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { mergeClass } from '$lib/components'

	type Tab = {
		id: string
		label: string
	}

	type Props = BaseProps &
		CustomProps<{
			tabs: Tab[]
			activeTab: string
			onchange?: (tabId: string) => void
		}>

	let { tabs, activeTab, onchange, class: className, ...rest }: Props = $props()
</script>

<div
	role="tablist"
	class={mergeClass(['d-tabs', 'd-tabs-lifted'], className)}
	{...rest}
>
	{#each tabs as tab (tab.id)}
		<button
			role="tab"
			class={mergeClass(
				['d-tab'],
				activeTab === tab.id ? 'd-tab-active' : undefined
			)}
			aria-selected={activeTab === tab.id}
			onclick={() => onchange?.(tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>
