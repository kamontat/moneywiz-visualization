<script lang="ts">
	import HardDriveIcon from '@iconify-svelte/lucide/hard-drive'

	import Alert, { type Variant } from '$components/atoms/Alert.svelte'
	import Container from '$components/atoms/Container.svelte'
	import Header from '$components/atoms/Header.svelte'
	import Link from '$components/atoms/Link.svelte'
	import DatabaseClearButton from '$components/molecules/DatabaseClearButton.svelte'
	import DatabaseUploadButton from '$components/molecules/DatabaseUploadButton.svelte'
	import NameHeader from '$components/molecules/NameHeader.svelte'
	import ThemeSelect from '$components/molecules/ThemeSelect.svelte'
	import { component } from '$lib/loggers'

	type Message = {
		id: string
		variant: Variant
		text: string
	}
	let messages = $state<Message[]>([])
	let uploading = $state(false)
	const log = component.extends('AppHeader')

	const onClearSuccess = () => {
		const len = messages.length
		messages.unshift({
			id: `C${len + 1}`,
			variant: 'success',
			text: 'Database cleared successfully',
		})
	}
	const onClearError = (err: Error) => {
		const len = messages.length
		messages.unshift({
			id: `C${len + 1}`,
			variant: 'error',
			text: `Database clear failed: ${err.message}`,
		})
	}
	const onUploadLoading = (loading: boolean) => {
		uploading = loading
	}
	const onUploadSuccess = (count: number) => {
		const len = messages.length
		messages.unshift({
			id: `U${len + 1}`,
			variant: 'success',
			text: `Imported ${count.toLocaleString()} transactions successfully`,
		})
	}
	const onUploadError = (err: Error) => {
		const len = messages.length
		messages.unshift({
			id: `U${len + 1}`,
			variant: 'error',
			text: `Database upload failed: ${err.message}`,
		})
	}

	const onAlertDismiss = (id?: string) => {
		messages = messages.filter((message) => message.id !== id)
		log.debug(`dismissed alert message: ${id} (%d remaining)`, messages.length)
	}
</script>

<Header>
	<NameHeader />
	<Container class="items-stretch gap-x-2">
		<Link
			href="/storage"
			class="d-btn gap-2 px-2 sm:px-3"
			aria-label="Open storage usage page"
		>
			<HardDriveIcon class="h-4 w-4" aria-hidden="true" />
			<span class="hidden sm:inline">Storage</span>
		</Link>
		<DatabaseClearButton
			{uploading}
			onsuccess={onClearSuccess}
			onfail={onClearError}
		/>
		<DatabaseUploadButton
			onsuccess={onUploadSuccess}
			onfail={onUploadError}
			onloadingchange={onUploadLoading}
		/>
		<ThemeSelect />
	</Container>
</Header>

<div class="d-stack">
	{#each messages as message (message.id)}
		<Alert id={message.id} variant={message.variant} onclose={onAlertDismiss}>
			{message.text}; Click to dismiss ({messages.length} remaining)
		</Alert>
	{/each}
</div>
