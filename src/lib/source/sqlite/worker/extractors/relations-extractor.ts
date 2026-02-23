import type { Database } from '@sqlite.org/sqlite-wasm'
import type {
	SQLiteRelations,
	SQLiteCategory,
	SQLiteTag,
} from '$lib/source/sqlite/models'
import { readRows } from '$lib/source/sqlite/worker/runtime'
import {
	getNumberValue,
	pushGrouped,
	toInteger,
} from '$lib/source/sqlite/worker/utils'

export const extractRelations = (
	db: Database,
	input: {
		categories: SQLiteCategory[]
		tags: SQLiteTag[]
	}
): SQLiteRelations => {
	const categoriesById = new Map(
		input.categories.map((category) => [category.id, category])
	)
	const tagsById = new Map(input.tags.map((tag) => [tag.id, tag]))

	const categoriesByTransaction = new Map<
		number,
		Array<{
			id: number
			name: string
			parentId?: number
			parentName?: string
		}>
	>()

	const categoryRows = readRows(
		db,
		'SELECT ZTRANSACTION, ZCATEGORY FROM ZCATEGORYASSIGMENT'
	)
	for (const row of categoryRows) {
		const transactionId = toInteger(getNumberValue(row, ['ZTRANSACTION']))
		const categoryId = toInteger(getNumberValue(row, ['ZCATEGORY']))
		if (transactionId === undefined || categoryId === undefined) continue
		const category = categoriesById.get(categoryId)
		if (!category) continue

		pushGrouped(categoriesByTransaction, transactionId, {
			id: category.id,
			name: category.name,
			parentId: category.parentId,
			parentName: category.parentName,
		})
	}

	const tagsByTransaction = new Map<
		number,
		Array<{ id: number; name: string }>
	>()
	const tagRows = readRows(
		db,
		'SELECT Z_36TRANSACTIONS, Z_35TAGS FROM Z_36TAGS'
	)
	for (const row of tagRows) {
		const transactionId = toInteger(getNumberValue(row, ['Z_36TRANSACTIONS']))
		const tagId = toInteger(getNumberValue(row, ['Z_35TAGS']))
		if (transactionId === undefined || tagId === undefined) continue
		const tag = tagsById.get(tagId)
		if (!tag) continue
		pushGrouped(tagsByTransaction, transactionId, {
			id: tag.id,
			name: tag.name,
		})
	}

	return {
		categoriesByTransaction,
		tagsByTransaction,
	}
}
