import type { SessionManifest } from '$lib/session/models'
import {
	clearSessionManifest,
	getSessionManifest,
	setSessionManifest,
} from '$lib/transactions/repository'

export const readSessionManifest = async (): Promise<
	SessionManifest | undefined
> => {
	return getSessionManifest()
}

export const writeSessionManifest = async (
	manifest: SessionManifest
): Promise<void> => {
	await setSessionManifest(manifest)
}

export const removeSessionManifest = async (): Promise<void> => {
	await clearSessionManifest()
}
