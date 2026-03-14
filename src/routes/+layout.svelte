<script>
	import { onMount } from 'svelte'

	import AppFooter from '$components/organisms/AppFooter.svelte'
	import AppHeader from '$components/organisms/AppHeader.svelte'
	import NotificationCenter from '$components/organisms/NotificationCenter.svelte'
	import { initializeApp } from '$lib/app/index.js'

	import '$css/global.css'
	let { children } = $props()

	onMount(() => {
		void initializeApp()
	})
</script>

<AppHeader />
<NotificationCenter />
{@render children()}
<AppFooter />
