<script lang="ts">
	import type { BaseProps, ComponentProps } from '$lib/components/models'
	import UploadIcon from '@iconify-svelte/lucide/upload'

	import Button from '$components/atoms/Button.svelte'

	type Props = Omit<BaseProps, 'children'> & ComponentProps<typeof Button>

	let { class: className, ...rest }: Props = $props()
</script>

<Button variant="primary" aria-label="Upload CSV" class={className} {...rest}>
	<UploadIcon class="h-5 w-5" aria-hidden="true" />
	<span class="ml-2 hidden sm:inline">Upload</span>
</Button>
