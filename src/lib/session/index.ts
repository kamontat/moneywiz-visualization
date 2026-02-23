import { createSessionAPIs } from './apis'
import { createSessionStore } from './store'

import { browser } from '$app/environment'

export const sessionStore = createSessionStore()
export const sessionAPIs = createSessionAPIs(sessionStore)
export const sessionUploading = sessionAPIs.uploading

if (browser) {
	void sessionAPIs.bootstrap()
}
