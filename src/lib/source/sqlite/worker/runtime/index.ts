import type {
	SQLiteWorkerRequest,
	SQLiteWorkerResponse,
} from '$lib/source/sqlite/models'
import { dispatchWorkerAction } from './dispatch'
export { forEachRow, getSqlite3, openDatabase, readRows } from './sqlite-engine'

export const executeWorkerRequest = async (
	request: SQLiteWorkerRequest,
	onProgress: (progress: SQLiteWorkerResponse) => void
): Promise<SQLiteWorkerResponse> => {
	return dispatchWorkerAction(request, onProgress)
}
