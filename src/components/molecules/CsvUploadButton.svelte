<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements'
	import type {
		BaseProps,
		ComponentProps,
		CustomProps,
		ElementProps,
	} from '$lib/components/models'
	import UploadIcon from '@iconify-svelte/lucide/upload'

	import Button from '$components/atoms/Button.svelte'
	import Input from '$components/atoms/Input.svelte'
	// import { csvStore, parseCsvFile } from '$lib/csv'
	import { component } from '$lib/loggers'
	// import { trxStore, parseTransactions } from '$lib/transactions'

	type Props = Omit<BaseProps, 'children'> &
		Pick<ElementProps<'input'>, 'onchange'> &
		Omit<ElementProps<'button'>, 'onclick' | 'onchange'> &
		ComponentProps<typeof Button> &
		CustomProps<{
			onsuccess?: () => void
			onfail?: (err: Error) => void
		}>

	let {
		class: className,
		onsuccess,
		onfail,
		onchange: _onchange,
		...rest
	}: Props = $props()
	const log = component.extends('CsvUploadButton')
	let file = $state<Input | null>(null)
	let loading = $state(false)

	const onchange: ChangeEventHandler<HTMLInputElement> = async (event) => {
		loading = true
		const target = event.currentTarget
		const file = target?.files?.[0]

		if (!file) {
			log.info('no file selected')
			return
		}

		log.info('file selected: %s', file.name)
		try {
			// const csv = await parseCsvFile(file)
			// const transactions = parseTransactions(csv)

			// await csvStore.reset()
			// await csvStore.merge({ [file.name]: csv })

			// await trxStore.reset()
			// await trxStore.merge(transactions)
			onsuccess?.()
		} catch (error) {
			onfail?.(error as Error)
		} finally {
			_onchange?.(event)
			loading = false
		}
	}
</script>

<Input
	type="file"
	class="sr-only"
	accept=".csv,text/csv"
	{onchange}
	bind:this={file}
/>
<Button
	variant="primary"
	aria-label="Upload CSV"
	class={className}
	onclick={() => file?.click()}
	{...rest}
>
	{#if loading}
		<span class="d-loading d-loading-sm d-loading-spinner"></span>
	{:else}
		<UploadIcon class="h-5 w-5" aria-hidden="true" />
	{/if}
	<span class="ml-2 hidden sm:inline">Upload</span>
</Button>
