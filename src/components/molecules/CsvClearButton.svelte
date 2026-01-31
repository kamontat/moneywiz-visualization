<script lang="ts">
	import type { BaseProps, ComponentProps } from '$lib/components/models'
	import TrashIcon from '@iconify-svelte/lucide/trash-2'

	import Button from '$components/atoms/Button.svelte'

	type Props = Omit<BaseProps, 'children'> & ComponentProps<typeof Button>

	let { class: className, ...rest }: Props = $props()
</script>

<Button variant="danger" aria-label="Clear loaded CSV" class={className} {...rest}>
	<TrashIcon class="h-5 w-5" aria-hidden="true" />
	<span class="hidden sm:inline">Clear</span>
</Button>
