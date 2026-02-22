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
	class="max-w-full text-xl leading-tight font-bold tracking-tight
		break-words text-base-content sm:text-2xl lg:text-3xl"
>
	{name}
</Title>
