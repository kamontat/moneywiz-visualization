<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements'
	import type {
		BaseProps,
		ComponentProps,
		CustomProps,
	} from '$lib/components/models'
	import TrashIcon from '@iconify-svelte/lucide/trash-2'

	import Button from '$components/atoms/Button.svelte'
	import { filterOptionsStore } from '$lib/analytics/filters/init'
	import { databaseAPIs, databaseStore } from '$lib/database'
	import { clearTransactions } from '$lib/transactions'

	type Props = Omit<BaseProps, 'children'> &
		ComponentProps<typeof Button> &
		CustomProps<{
			uploading?: boolean
			onsuccess?: () => void
			onfail?: (err: Error) => void
		}>

	let {
		class: className,
		uploading = false,
		onsuccess,
		onfail,
		onclick: _onclick,
		...rest
	}: Props = $props()
	let loading = $state(false)

	const onclick: MouseEventHandler<HTMLButtonElement> = async (event) => {
		loading = true
		try {
			// Clear transactions first to avoid race condition with databaseStore subscribers
			await clearTransactions()
			await databaseAPIs.reset()
			await filterOptionsStore.resetAsync()
			onsuccess?.()
		} catch (error) {
			onfail?.(error as Error)
			return
		} finally {
			_onclick?.(event)
			loading = false
		}
	}
</script>

{#if $databaseStore && !uploading}
	<Button
		variant="danger"
		aria-label="Clear loaded database"
		class={className}
		{onclick}
		{...rest}
	>
		{#if loading}
			<span class="d-loading d-loading-sm d-loading-spinner"></span>
		{:else}
			<TrashIcon class="h-5 w-5" aria-hidden="true" />
		{/if}

		<span class="hidden sm:inline">Clear</span>
	</Button>
{/if}
