<script>
	import AppFooter from '$components/organisms/AppFooter.svelte'
	import AppHeader from '$components/organisms/AppHeader.svelte'

	import '$css/global.css'
	let { children } = $props()
</script>

<AppHeader />
{@render children()}
<AppFooter />
