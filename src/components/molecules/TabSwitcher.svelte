<script lang="ts">
	import type { ComponentType } from 'svelte'
	import type { BaseProps, CustomProps } from '$lib/components/models'
	import { mergeClass } from '$lib/components'

	type Tab = {
		id: string
		label: string
		icon?: ComponentType
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
	class={mergeClass(
		['d-tabs', 'd-tabs-box', 'bg-base-200', 'p-1', 'rounded-box', 'gap-2'],
		className
	)}
	{...rest}
>
	{#each tabs as tab (tab.id)}
		<button
			role="tab"
			class={mergeClass(
				['d-tab', 'gap-2', 'transition-all', 'duration-200'],
				activeTab === tab.id
					? 'd-tab-active rounded-lg bg-base-100 shadow-sm'
					: 'hover:bg-base-300/50'
			)}
			aria-selected={activeTab === tab.id}
			onclick={() => onchange?.(tab.id)}
		>
			{#if tab.icon}
				{@const Icon = tab.icon}
				<Icon class="size-4" />
			{/if}
			{tab.label}
		</button>
	{/each}
</div>
