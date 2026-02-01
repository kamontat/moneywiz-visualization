<script lang="ts">
	import DotIcon from '@iconify-svelte/lucide/dot'
	import { onMount } from 'svelte'

	import Container from '$components/atoms/Container.svelte'
	import Link from '$components/atoms/Link.svelte'

	let host = $state('unknown')
	let utm = $derived(`utm_source=${host}&utm_medium=footer&utm_campaign=direct`)
	onMount(() => {
		if (typeof window !== 'undefined') {
			host = window.location.host
		}
	})

	const links = [
		{
			href: 'https://github.com/kamontat/moneywiz-visualization/?',
			name: 'Source',
			label: 'Go to source code repository',
		},
		{
			href: `https://kc.in.th/?`,
			name: '@kamontat',
			label: 'Go to creator website',
		},
		{ href: `https://google.com/?`, name: 'Google', label: 'Go to Google' },
	]
</script>

<Container class="items-center">
	{#each links as link, i (link.label)}
		{#if i > 0}
			<DotIcon class="h-4 w-4" />
		{/if}
		<Link
			variant="secondary"
			class="text-lg"
			href={new URL(link.href + utm).toString()}
			aria-label={link.label}
		>
			{link.name}
		</Link>
	{/each}
</Container>
