import { writable } from 'svelte/store'

import { createSessionController } from './controllers'
import {
	createAnalyticsStore,
	createBootstrapProgressStore,
	createFilterOptionsStore,
	createFilterStore,
	createSessionStore,
	createUploadProgressStore,
} from './sessions'

import { browser } from '$app/environment'

// Transaction utilities
export {
	getCategoryFullName,
	extractCategories,
	extractPayees,
	extractTagCategories,
	extractAccounts,
} from './transactionUtils'

export const appSessionStore = createSessionStore()
export const appFilterStore = createFilterStore()
export const appFilterOptionsStore = createFilterOptionsStore()
export const appAnalyticsStore = createAnalyticsStore()
export const appBootstrapProgressStore = createBootstrapProgressStore()
export const appUploadProgressStore = createUploadProgressStore()
export const appSessionUploading = writable(false)

export const appSessionController = createSessionController(
	appSessionStore,
	appSessionUploading
)

// Component-facing aliases
export { appSessionStore as sessionStore }
export { appSessionUploading as sessionUploading }
export const sessionAPIs = {
	upload: appSessionController.upload,
	clear: appSessionController.clear,
	bootstrap: appSessionController.bootstrap,
	status: appSessionController.status,
	uploading: appSessionUploading,
}

let initializePromise: Promise<void> | null = null

export async function initializeApp(): Promise<void> {
	if (!browser) return

	if (!initializePromise) {
		initializePromise = appSessionController.bootstrap().catch((error) => {
			initializePromise = null
			throw error
		})
	}

	await initializePromise
}
