<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements'
	import type { BaseProps, ComponentProps } from '$lib/components/models'
	import TrashIcon from '@iconify-svelte/lucide/trash-2'

	import Button from '$components/atoms/Button.svelte'
	import { csvStore, trxStore } from '$lib/stores'

	type Props = Omit<BaseProps, 'children'> & ComponentProps<typeof Button>

	let { class: className, onclick: _onclick, ...rest }: Props = $props()
	const onclick: MouseEventHandler<HTMLButtonElement> = (event) => {
		csvStore.reset()
		trxStore.reset()
		// filterStore.reset()

		_onclick?.(event)
	}
</script>

{#if $trxStore.fileName}
	<Button
		variant="danger"
		aria-label="Clear loaded CSV"
		class={className}
		{onclick}
		{...rest}
	>
		<TrashIcon class="h-5 w-5" aria-hidden="true" />
		<span class="hidden sm:inline">Clear</span>
	</Button>
{/if}
