<script lang="ts">
	import type { CustomProps, BaseProps } from '$lib/components/models'
	import Title from '$components/atoms/Title.svelte'

	type Props = BaseProps &
		CustomProps<{
			name: string
		}>

	let { name }: Props = $props()
</script>

<Title tag="h1">{name}</Title>
