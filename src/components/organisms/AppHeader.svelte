<script lang="ts">
	import Alert, { type Variant } from '$components/atoms/Alert.svelte'
	import Container from '$components/atoms/Container.svelte'
	import Header from '$components/atoms/Header.svelte'
	import CsvClearButton from '$components/molecules/CsvClearButton.svelte'
	import CsvUploadButton from '$components/molecules/CsvUploadButton.svelte'
	import NameHeader from '$components/molecules/NameHeader.svelte'
	import ThemeSelect from '$components/molecules/ThemeSelect.svelte'
	import { component } from '$lib/loggers'

	type Message = {
		id: string
		variant: Variant
		text: string
	}
	let messages = $state<Message[]>([])
	const log = component.extends('AppHeader')

	const onClearSuccess = () => {
		const len = messages.length
		messages.unshift({
			id: `C${len + 1}`,
			variant: 'success',
			text: 'CSV data cleared successfully',
		})
	}
	const onClearError = (err: Error) => {
		const len = messages.length
		messages.unshift({
			id: `C${len + 1}`,
			variant: 'error',
			text: `CSV clear failed: ${err.message}`,
		})
	}
	const onUploadSuccess = () => {
		const len = messages.length
		messages.unshift({
			id: `U${len + 1}`,
			variant: 'success',
			text: 'CSV data uploaded successfully',
		})
	}
	const onUploadError = (err: Error) => {
		const len = messages.length
		messages.unshift({
			id: `U${len + 1}`,
			variant: 'error',
			text: `CSV upload failed: ${err.message}`,
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
		<CsvClearButton onsuccess={onClearSuccess} onfail={onClearError} />
		<CsvUploadButton onsuccess={onUploadSuccess} onfail={onUploadError} />
		<ThemeSelect />
	</Container>
</Header>

{#each messages as message (message.id)}
	<Alert id={message.id} variant={message.variant} onclose={onAlertDismiss}>
		{message.text}
	</Alert>
{/each}
