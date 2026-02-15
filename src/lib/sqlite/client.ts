import type { SQLiteSession, SQLiteSessionOptions } from './models'
import { createSQLiteSession as createSQLiteRepositorySession } from './repository'

export const createSQLiteSession = async (
	file: File,
	options: SQLiteSessionOptions = {}
): Promise<SQLiteSession> => {
	return createSQLiteRepositorySession(file, options)
}
