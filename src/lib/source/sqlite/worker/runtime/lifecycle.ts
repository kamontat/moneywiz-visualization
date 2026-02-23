/// <reference lib="webworker" />

import type { SQLiteWorkerResponse } from '$lib/source/sqlite/models'

const workerScope = self as DedicatedWorkerGlobalScope

export const postWorkerResponse = (response: SQLiteWorkerResponse): void => {
	workerScope.postMessage(response)
}
