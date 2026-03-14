export interface Queriable {
	query<T>(sql: string, params?: unknown[]): Promise<T[]>
}
