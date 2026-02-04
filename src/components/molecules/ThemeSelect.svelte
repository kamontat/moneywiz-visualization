<script lang="ts">
	import Select from '$components/atoms/Select.svelte'
	import { themeStore, themeState, themeList } from '$lib/themes'

	let current = $state($themeStore.current)

	$effect(() => {
		themeStore.update((prev) => {
			// Only trigger when value is changed
			if (prev.current !== current) themeStore.trigger('set', current)
			return themeState.normalize({ current })
		})
	})

	$effect(() => {
		if (current !== $themeStore.current) {
			current = $themeStore.current
		}

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
