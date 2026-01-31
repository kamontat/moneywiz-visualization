<script lang="ts">
	import Select from '$components/atoms/Select.svelte'
	import { themeStore, themeMap } from '$lib/stores'

	const options = [{ label: 'System', value: 'system' }].concat(
		Object.entries(themeMap).map(([key, theme]) => ({
			label: theme.label,
			value: key,
		}))
	)
	let current = $state($themeStore.data)

	$effect(() => {
		themeStore.update((data) => {
			return { ...data, data: current }
		})
	})

	$effect(() => {
		document.documentElement.dataset['theme'] = $themeStore.theme
		document.documentElement.dataset['themeSchema'] = $themeStore.schema
	})
</script>

<Select
	bind:value={current}
	name="theme"
	values={options}
	class="min-w-22 bg-accent text-accent-content d-select-accent"
	aria-label="Select theme"
/>
