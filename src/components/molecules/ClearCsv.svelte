<script lang="ts">
	import Button from '$components/atoms/Button.svelte';
	import TrashIcon from '@iconify-svelte/lucide/trash-2';

	interface Props {
		onclear?: () => void;
	}

	let { onclear }: Props = $props();
</script>

<Button variant="danger" onclick={onclear} label="Clear loaded CSV">
	<TrashIcon class="h-4 w-4" aria-hidden="true" />
	<span class="hidden sm:inline">Clear</span>
</Button>
