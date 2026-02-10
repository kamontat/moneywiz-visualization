<script lang="ts">
	import type {
		BaseProps,
		CustomProps,
		ElementProps,
	} from '$lib/components/models'
	import SearchIcon from '@iconify-svelte/lucide/search'

	import { mergeClass, newTwClass } from '$lib/components'

	type Props = Omit<BaseProps, 'children'> &
		CustomProps<{
			value?: string
		}> &
		ElementProps<'input'>

	let { value = $bindable(''), class: className, ...rest }: Props = $props()

	const baseClass = newTwClass([
		'd-input',
		'd-input-bordered',
		'd-input-sm',
		'flex',
		'items-center',
		'gap-2',
	])
</script>

<label class={mergeClass(baseClass, className)}>
	<input type="text" class="grow" bind:value {...rest} />
	<SearchIcon class="size-3 opacity-50" />
</label>
