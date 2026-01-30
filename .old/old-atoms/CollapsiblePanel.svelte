<script lang="ts">
	import type { BaseProps, ElementProps } from '$lib/models/props'
	import ChevronDown from '@iconify-svelte/lucide/chevron-down'
	import ChevronUp from '@iconify-svelte/lucide/chevron-up'
	import { slide } from 'svelte/transition'
	import Button from './Button.svelte'
	import Panel from './Panel.svelte'
	import Text from './Text.svelte'

	type Props = BaseProps &
		ElementProps<'div' | 'section'> & {
			title: string
			defaultOpen?: boolean
		}

	let { children, title, defaultOpen = true, class: className = '', ...rest }: Props = $props()

	let isOpen = $state(defaultOpen)

	function toggle() {
		isOpen = !isOpen
	}
</script>

<Panel class={['flex', 'flex-col', 'gap-4', className].flat()} {...rest}>
	<div class="flex items-center justify-between">
		<Text tag="h3" class="m-0 text-lg font-semibold">{title}</Text>
		<Button
			variant="icon"
			onclick={toggle}
			aria-expanded={isOpen}
			label={isOpen ? 'Collapse panel' : 'Expand panel'}
		>
			{#if isOpen}
				<ChevronUp class="h-5 w-5" />
			{:else}
				<ChevronDown class="h-5 w-5" />
			{/if}
		</Button>
	</div>

	{#if isOpen}
		<div transition:slide={{ duration: 200, axis: 'y' }}>
			{@render children?.()}
		</div>
	{/if}
</Panel>
