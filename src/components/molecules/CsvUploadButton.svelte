<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements'
	import type {
		BaseProps,
		ComponentProps,
		CustomProps,
		ElementProps,
	} from '$lib/components/models'
	import type { ImportProgress } from '$lib/transactions/models'
	import UploadIcon from '@iconify-svelte/lucide/upload'

	import Button from '$components/atoms/Button.svelte'
	import Input from '$components/atoms/Input.svelte'
	import { csvAPIs, csvUploading } from '$lib/csv'
	import { component } from '$lib/loggers'
	import {
		importTransactionsFromFile,
		clearTransactions,
	} from '$lib/transactions'

	type Props = Omit<BaseProps, 'children'> &
		Pick<ElementProps<'input'>, 'onchange'> &
		Omit<ElementProps<'button'>, 'onclick' | 'onchange'> &
		ComponentProps<typeof Button> &
		CustomProps<{
			onsuccess?: (count: number) => void
			onfail?: (err: Error) => void
			onprogress?: (progress: ImportProgress) => void
			onloadingchange?: (loading: boolean) => void
		}>

	let {
		class: className,
		onsuccess,
		onfail,
		onprogress,
		onloadingchange,
		onchange: _onchange,
		...rest
	}: Props = $props()
	const log = component.extends('CsvUploadButton')
	let fileInput = $state<Input | null>(null)
	let loading = $state(false)
	let progress = $state<ImportProgress | null>(null)

	const onchange: ChangeEventHandler<HTMLInputElement> = async (event) => {
		loading = true
		csvUploading.set(true)
		onloadingchange?.(true)
		progress = null
		const target = event.currentTarget
		const file = target?.files?.[0]

		if (!file) {
			log.info('no file selected')
			loading = false
			csvUploading.set(false)
			onloadingchange?.(false)
			return
		}

		log.info('file selected: %s', file.name)
		try {
			await clearTransactions()
			const count = await importTransactionsFromFile(file, {
				onProgress: (p) => {
					progress = p
					onprogress?.(p)
				},
			})

			await csvAPIs.parse(file)
			onsuccess?.(count)
		} catch (error) {
			onfail?.(error as Error)
		} finally {
			_onchange?.(event)
			loading = false
			csvUploading.set(false)
			onloadingchange?.(false)
			progress = null
		}
	}
</script>

<Input
	type="file"
	class="sr-only"
	accept=".csv,text/csv"
	{onchange}
	onclick={(e) => {
		// Reset input value so re-selecting the same file triggers onchange
		e.currentTarget.value = ''
	}}
	bind:this={fileInput}
	disabled={loading}
/>
<Button
	variant="primary"
	aria-label="Upload CSV"
	class={className}
	onclick={() => fileInput?.click()}
	disabled={loading}
	{...rest}
>
	{#if loading}
		<span class="tabular-nums">{progress?.percentage ?? 0}%</span>
	{:else}
		<UploadIcon class="h-5 w-5" aria-hidden="true" />
		<span class="ml-2 hidden sm:inline">Upload</span>
	{/if}
</Button>
