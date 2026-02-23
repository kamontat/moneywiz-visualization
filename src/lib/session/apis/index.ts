import type { SessionProgress, SessionStore } from '$lib/session/models'
import { writable, type Writable } from 'svelte/store'

import { bootstrapSession } from './bootstrap'
import { clearSessionData } from './clear'
import { refreshSessionStatus } from './status'
import { uploadSessionFile } from './upload'

import { browser } from '$app/environment'

export interface SessionAPIs {
	name: 'session'
	version: 1
	bootstrap: (onProgress?: (progress: SessionProgress) => void) => Promise<void>
	upload: (
		file: File,
		onProgress?: (progress: SessionProgress) => void
	) => Promise<number>
	clear: () => Promise<void>
	status: () => Promise<void>
	uploading: Writable<boolean>
}

export const createSessionAPIs = (store: SessionStore) => {
	const uploading = writable(false)

	const bootstrap = async (
		onProgress?: (progress: SessionProgress) => void
	) => {
		if (!browser) return
		await bootstrapSession(store, onProgress)
	}

	const upload = async (
		file: File,
		onProgress?: (progress: SessionProgress) => void
	): Promise<number> => {
		uploading.set(true)
		try {
			const count = await uploadSessionFile(store, file, onProgress)
			return count
		} finally {
			uploading.set(false)
		}
	}

	const clear = async () => {
		uploading.set(true)
		try {
			await clearSessionData(store)
		} finally {
			uploading.set(false)
		}
	}

	const status = async () => {
		if (!browser) return
		await refreshSessionStatus(store)
	}

	return {
		name: 'session' as const,
		version: 1 as const,
		bootstrap,
		upload,
		clear,
		status,
		uploading,
	}
}
