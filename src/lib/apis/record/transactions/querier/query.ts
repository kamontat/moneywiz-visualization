import type {
	RawCategoryAssignment,
	RawTagAssignment,
	RawTransaction,
} from './types.js'
import type { Queriable } from '$lib/types/index.js'

const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1)

/** Transaction entity type IDs from Z_PRIMARYKEY */
const TRANSACTION_ENTITY_TYPES = [37, 47, 45, 46, 44, 40, 41, 42, 43]

/** SQL to fetch all transaction rows with account info */
const TRANSACTIONS_SQL = `
  SELECT
    t.Z_PK as id,
    t.Z_ENT as entityType,
		COALESCE(t.ZDATE1, t.ZDATE) as date,
		COALESCE(t.ZAMOUNT1, t.ZAMOUNT, 0) as amount,
		COALESCE(
			t.ZORIGINALCURRENCY,
			t.ZORIGINALSENDERCURRENCY,
			t.ZORIGINALRECIPIENTCURRENCY,
			acct.ZCURRENCYNAME,
			acct.ZCURRENCYNAME1,
			acct.ZCURRENCYNAME2,
			acct.ZCURRENCYNAME3
		) as currency,
		COALESCE(
			payee.ZNAME,
			payee.ZNAME1,
			payee.ZNAME2,
			payee.ZNAME3,
			payee.ZNAME4,
			payee.ZNAME5,
			payee.ZNAME6
		) as payee,
		COALESCE(t.ZNOTES1, t.ZNOTES) as notes,
    acct.Z_PK as accountId,
		COALESCE(
			acct.ZNAME,
			acct.ZNAME1,
			acct.ZNAME2,
			acct.ZNAME3,
			acct.ZNAME4,
			acct.ZNAME5,
			acct.ZNAME6
		) as accountName,
    acct.Z_ENT as accountEntityType,
		COALESCE(
			acct.ZCURRENCYNAME,
			acct.ZCURRENCYNAME1,
			acct.ZCURRENCYNAME2,
			acct.ZCURRENCYNAME3
		) as accountCurrency
  FROM ZSYNCOBJECT t
	LEFT JOIN ZSYNCOBJECT acct
		ON COALESCE(t.ZACCOUNT2, t.ZACCOUNT1, t.ZACCOUNT) = acct.Z_PK
	LEFT JOIN ZSYNCOBJECT payee
		ON COALESCE(t.ZPAYEE2, t.ZPAYEE1, t.ZPAYEE) = payee.Z_PK
  WHERE t.Z_ENT IN (${TRANSACTION_ENTITY_TYPES.join(',')})
	ORDER BY COALESCE(t.ZDATE1, t.ZDATE) ASC, t.Z_PK ASC
`

/** SQL to fetch category assignments for transactions */
const CATEGORIES_SQL = `
  SELECT
    ca.ZTRANSACTION as transactionId,
    cat.Z_PK as categoryId,
		COALESCE(
			cat.ZNAME,
			cat.ZNAME1,
			cat.ZNAME2,
			cat.ZNAME3,
			cat.ZNAME4,
			cat.ZNAME5,
			cat.ZNAME6
		) as categoryName,
		COALESCE(
			parent.ZNAME,
			parent.ZNAME1,
			parent.ZNAME2,
			parent.ZNAME3,
			parent.ZNAME4,
			parent.ZNAME5,
			parent.ZNAME6
		) as parentName
  FROM ZCATEGORYASSIGMENT ca
  JOIN ZSYNCOBJECT cat ON ca.ZCATEGORY = cat.Z_PK
	LEFT JOIN ZSYNCOBJECT parent ON cat.ZPARENTCATEGORY = parent.Z_PK
  WHERE ca.ZTRANSACTION IS NOT NULL
`

/** SQL to fetch tag assignments for transactions */
const TAGS_SQL = `
  SELECT
    zt.Z_36TRANSACTIONS as transactionId,
		COALESCE(
			tag.ZNAME,
			tag.ZNAME1,
			tag.ZNAME2,
			tag.ZNAME3,
			tag.ZNAME4,
			tag.ZNAME5,
			tag.ZNAME6
		) as tagName
  FROM Z_36TAGS zt
  JOIN ZSYNCOBJECT tag ON zt.Z_35TAGS = tag.Z_PK
`

function parseTag(tagName: string): { category: string; name: string } {
	const sep = tagName.indexOf(': ')
	if (sep === -1) return { category: '', name: tagName }

	let category = tagName.slice(0, sep)
	const name = tagName.slice(sep + 2)

	if (category === 'Zvent') category = 'Event'

	return { category, name }
}

interface RawTransactionRow {
	id: number
	entityType: number
	date: number | null
	amount: number | null
	currency: string | null
	payee: string | null
	notes: string | null
	accountId: number | null
	accountName: string | null
	accountEntityType: number | null
	accountCurrency: string | null
}

interface RawCategoryRow {
	transactionId: number
	categoryId: number
	categoryName: string
	parentName: string | null
}

interface RawTagRow {
	transactionId: number
	tagName: string
}

export async function queryTransactions(
	db: Queriable
): Promise<RawTransaction[]> {
	const [rows, categories, tags] = await Promise.all([
		db.query<RawTransactionRow>(TRANSACTIONS_SQL),
		db.query<RawCategoryRow>(CATEGORIES_SQL),
		db.query<RawTagRow>(TAGS_SQL),
	])

	const categoryMap = new Map<number, RawCategoryAssignment>()
	for (const cat of categories) {
		categoryMap.set(cat.transactionId, {
			transactionId: cat.transactionId,
			categoryId: cat.categoryId,
			categoryName: cat.categoryName,
			parentName: cat.parentName,
		})
	}

	const tagMap = new Map<number, RawTagAssignment[]>()
	for (const tag of tags) {
		let list = tagMap.get(tag.transactionId)
		if (!list) {
			list = []
			tagMap.set(tag.transactionId, list)
		}
		list.push({ transactionId: tag.transactionId, tagName: tag.tagName })
	}

	return rows.map((row): RawTransaction => {
		const cat = categoryMap.get(row.id)
		const rawTags = tagMap.get(row.id) ?? []
		const parsedTags = rawTags.map((t) => parseTag(t.tagName))

		return {
			id: row.id,
			entityType: row.entityType,
			date: row.date,
			amount: row.amount,
			currency: row.currency ?? row.accountCurrency ?? null,
			payee: row.payee,
			notes: row.notes,
			accountId: row.accountId,
			accountName: row.accountName,
			accountEntityType: row.accountEntityType,
			accountCurrency: row.accountCurrency,
			categoryName: cat?.categoryName ?? null,
			categoryParentName: cat?.parentName ?? null,
			tags: parsedTags,
		}
	})
}

export { APPLE_REFERENCE_EPOCH_MS }
