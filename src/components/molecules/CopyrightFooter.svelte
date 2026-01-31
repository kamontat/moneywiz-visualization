<script lang="ts">
	import Text from '$components/atoms/Text.svelte'
	import { newTwClass } from '$lib/components'

	const baseClass = newTwClass(['whitespace-nowrap', 'font-semibold'])

	const year = new Date().getFullYear()
</script>

<Text class={baseClass}>Copyright © {year} - All right reserved</Text>
