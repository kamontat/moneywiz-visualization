<script lang="ts">
	import Select from '$components/atoms/Select.svelte'
	import { themeStore, themeList } from '$lib/themes'

	let current = $state($themeStore.current)

	$effect(() => {
		themeStore.merge({ current })
	})

	$effect(() => {
		if (current !== $themeStore.current) current = $themeStore.current

		document.documentElement.dataset['theme'] = $themeStore.theme.name
		document.documentElement.dataset['themeSchema'] = $themeStore.theme.schema
	})
</script>

<Select
	bind:value={current}
	name="theme"
	values={themeList}
	class="min-w-22 text-base-content d-select-accent focus-within:outline-0 focus:outline-0"
	aria-label="Select theme"
/>
