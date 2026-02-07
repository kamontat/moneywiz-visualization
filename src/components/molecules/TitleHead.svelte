<script lang="ts">
	import type { CustomProps, BaseProps } from '$lib/components/models'
	import Title from '$components/atoms/Title.svelte'

	type Props = BaseProps &
		CustomProps<{
			name: string
		}>

	let { name }: Props = $props()
</script>

<Title
	tag="h1"
	class="text-2xl font-bold tracking-tight text-base-content sm:text-3xl"
>
	{name}
</Title>
