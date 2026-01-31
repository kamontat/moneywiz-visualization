<script lang="ts">
	import Select from '$components/atoms/Select.svelte'
	import { themeStore } from '$lib/stores'

	const options = [
		{
			label: 'System',
			value: 'system',
		},
		{
			label: 'Light/Default',
			value: 'light',
		},
		{
			label: 'Dark/Default',
			value: 'dark',
		},
		{
			label: 'Light/Cupcake',
			value: 'cupcake',
		},
	]
	let current = $state($themeStore.data)

	$effect(() => {
		themeStore.update((data) => {
			return { ...data, data: current }
		})
	})

	$effect(() => {
		document.documentElement.dataset['theme'] = $themeStore.theme
	})
</script>

<Select
	bind:value={current}
	name="theme"
	values={options}
	class="min-w-36"
	aria-label="Select theme"
/>
