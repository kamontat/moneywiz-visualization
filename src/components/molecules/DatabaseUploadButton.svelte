<script lang="ts">
	import type { ChangeEventHandler } from 'svelte/elements'
	import type { BootstrapProgress, UploadProgress } from '$lib/apis/sqlite'
	import type {
		BaseProps,
		ComponentProps,
		CustomProps,
		ElementProps,
	} from '$lib/ui'
	import UploadIcon from '@iconify-svelte/lucide/upload'

	import Button from '$components/atoms/Button.svelte'
	import Input from '$components/atoms/Input.svelte'
	import { sessionAPIs } from '$lib/app'
	import { component } from '$lib/utils'

	type UploadSessionProgress = BootstrapProgress | UploadProgress

	type Props = Omit<BaseProps, 'children'> &
		Pick<ElementProps<'input'>, 'onchange'> &
		Omit<ElementProps<'button'>, 'onclick' | 'onchange'> &
		ComponentProps<typeof Button> &
		CustomProps<{
			onsuccess?: (count: number) => void
			onfail?: (err: Error) => void
			onprogress?: (progress: UploadSessionProgress) => void
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
	const log = component.extends('DatabaseUploadButton')
	let fileInput = $state<Input | null>(null)
	let loading = $state(false)
	let progress = $state<UploadSessionProgress | null>(null)

	const onchange: ChangeEventHandler<HTMLInputElement> = async (event) => {
		loading = true
		onloadingchange?.(true)
		progress = null
		const target = event.currentTarget
		const file = target?.files?.[0]

		if (!file) {
			log.info('no file selected')
			loading = false
			onloadingchange?.(false)
			return
		}

		log.info('file selected: %s', file.name)
		try {
			const count = await sessionAPIs.upload(file, (p) => {
				progress = p
				onprogress?.(p)
			})
			onsuccess?.(count)
		} catch (error) {
			onfail?.(error as Error)
		} finally {
			_onchange?.(event)
			loading = false
			onloadingchange?.(false)
			progress = null
		}
	}
</script>

<Input
	type="file"
	class="sr-only"
	accept=".sqlite,.db,.sqlite3"
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
	aria-label="Upload Database"
	class={className}
	onclick={() => fileInput?.click()}
	disabled={loading}
	{...rest}
>
	{#if loading}
		<span class="tabular-nums"
			>{progress
				? Math.round((progress.processed / (progress.total || 1)) * 100)
				: 0}%</span
		>
	{:else}
		<UploadIcon class="h-5 w-5" aria-hidden="true" />
		<span class="ml-2 hidden sm:inline">Upload</span>
	{/if}
</Button>
