<script lang="ts">
	import HardDriveIcon from '@iconify-svelte/lucide/hard-drive'

	import Container from '$components/atoms/Container.svelte'
	import Header from '$components/atoms/Header.svelte'
	import Link from '$components/atoms/Link.svelte'
	import DatabaseClearButton from '$components/molecules/DatabaseClearButton.svelte'
	import DatabaseUploadButton from '$components/molecules/DatabaseUploadButton.svelte'
	import NameHeader from '$components/molecules/NameHeader.svelte'
	import ThemeSelect from '$components/molecules/ThemeSelect.svelte'
	import { databaseStore } from '$lib/database'
	import { pushNotification } from '$lib/notifications'

	let uploading = $state(false)

	const onClearSuccess = () => {
		pushNotification({
			variant: 'success',
			text: 'Database cleared successfully',
		})
	}
	const onClearError = (err: Error) => {
		pushNotification({
			variant: 'error',
			text: `Database clear failed: ${err.message}`,
		})
	}
	const onUploadLoading = (loading: boolean) => {
		uploading = loading
	}
	const onUploadSuccess = (count: number) => {
		pushNotification({
			variant: 'success',
			text: `Imported ${count.toLocaleString()} transactions successfully`,
		})
	}
	const onUploadError = (err: Error) => {
		pushNotification({
			variant: 'error',
			text: `Database upload failed: ${err.message}`,
		})
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
		{#if !$databaseStore || uploading}
			<DatabaseUploadButton
				onsuccess={onUploadSuccess}
				onfail={onUploadError}
				onloadingchange={onUploadLoading}
			/>
		{/if}
		<ThemeSelect />
	</Container>
</Header>
