<script lang="ts">
	import Link from '$components/atoms/Link.svelte'
	import Text from '$components/atoms/Text.svelte'
	import { newTwClass } from '$lib/components'

	const baseClass = newTwClass([
		'tracking-wider',
		'whitespace-nowrap',
		'uppercase',
		'font-semibold',
		'text-base-content',
	])
</script>

<Link href="/" aria-label="Go to homepage">
	<Text class={baseClass}>MoneyWiz Report</Text>
</Link>
