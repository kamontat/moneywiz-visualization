<script>
	import AppFooter from '$components/organisms/AppFooter.svelte'
	import AppHeader from '$components/organisms/AppHeader.svelte'
	import NotificationCenter from '$components/organisms/NotificationCenter.svelte'

	import '$css/global.css'
	let { children } = $props()
</script>

<AppHeader />
<NotificationCenter />
{@render children()}
<AppFooter />
