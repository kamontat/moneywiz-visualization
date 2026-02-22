<script lang="ts">
	import Alert from '$components/atoms/Alert.svelte'
	import { dismissNotification, notificationsStore } from '$lib/notifications'

	const onAlertDismiss = (id?: string) => {
		dismissNotification(id)
	}
</script>

<div class="d-stack" aria-live="polite" aria-atomic="false">
	{#each $notificationsStore as notification (notification.id)}
		<Alert
			id={notification.id}
			variant={notification.variant}
			onclose={onAlertDismiss}
		>
			{notification.text}
		</Alert>
	{/each}
</div>
