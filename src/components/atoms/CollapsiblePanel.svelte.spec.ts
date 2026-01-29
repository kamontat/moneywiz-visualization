import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import CollapsiblePanel from './CollapsiblePanel.svelte'

describe('CollapsiblePanel', () => {
	it('renders title and is open by default', async () => {
		page.render(CollapsiblePanel, { title: 'My Panel' })

		await expect.element(page.getByText('My Panel')).toBeInTheDocument()
		// Toggle button
		const button = page.getByLabelText('Collapse panel')
		await expect.element(button).toBeInTheDocument()
		await expect.element(button).toHaveAttribute('aria-expanded', 'true')
	})

	it('can be toggled', async () => {
		page.render(CollapsiblePanel, { title: 'Toggle Panel' })

		// Initially using 'Collapse panel' label
		const button = page.getByLabelText('Collapse panel')
		await expect.element(button).toHaveAttribute('aria-expanded', 'true')

		await button.click()

		// Now should have 'Expand panel' label
		// We need to re-query or expect the button to update its name if accessibility name changes
		// Since label changed, the locator getByLabelText('Collapse panel') might fail if it tries to find it again, or succeed if it still points to the element but verify props.
		// However, aria-label prop on button changes.
		// Let's find by expand panel
		await expect.element(page.getByLabelText('Expand panel')).toBeInTheDocument()
		const expandButton = page.getByLabelText('Expand panel')
		await expect.element(expandButton).toHaveAttribute('aria-expanded', 'false')
	})

	it('respects defaultOpen prop', async () => {
		page.render(CollapsiblePanel, { title: 'Closed Panel', defaultOpen: false })

		const button = page.getByLabelText('Expand panel')
		await expect.element(button).toBeInTheDocument()
		await expect.element(button).toHaveAttribute('aria-expanded', 'false')
	})
})
