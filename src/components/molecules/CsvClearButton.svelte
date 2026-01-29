<script lang="ts">
	import Button from '$components/atoms/Button.svelte'
	import type { ComponentProps } from '$lib/models/props'
	import TrashIcon from '@iconify-svelte/lucide/trash-2'

	type Props = ComponentProps<typeof Button>

	let props: Props = $props()
</script>

<Button variant="danger" label="Clear loaded CSV" {...props}>
	<TrashIcon class="h-4 w-4" aria-hidden="true" />
	<span class="hidden sm:inline">Clear</span>
</Button>
