import type {
	ParsedBaseTransaction,
	ParsedReconcileTransaction,
} from '$lib/ledger/models'
import type { SQLiteTransaction } from '$lib/source/sqlite/models'
import { SQLITE_ENTITY_ID } from '$lib/source/sqlite/models'

const CHECK_NUMBER = ''

export const isReconcileEntity = (entityId: number): boolean => {
	return entityId === SQLITE_ENTITY_ID.ReconcileTransaction
}

export const classifyReconcile = (
	row: SQLiteTransaction,
	base: ParsedBaseTransaction,
	payee: string
): ParsedReconcileTransaction | undefined => {
	if (!isReconcileEntity(row.entityId)) return undefined

	return {
		...base,
		type: 'Reconcile',
		payee,
		checkNumber: CHECK_NUMBER,
	}
}
