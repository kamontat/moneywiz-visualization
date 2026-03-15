import type { RawAccount } from './types'
import type { Queriable } from '$lib/types'

const ACCOUNTS_SQL = `
  SELECT
    Z_PK as id,
    COALESCE(ZNAME, ZNAME1, ZNAME2, ZNAME3, ZNAME4, ZNAME5, ZNAME6) as name,
    Z_ENT as entityType,
    COALESCE(
      ZCURRENCYNAME,
      ZCURRENCYNAME1,
      ZCURRENCYNAME2,
      ZCURRENCYNAME3
    ) as currency
  FROM ZSYNCOBJECT
  WHERE Z_ENT IN (10, 11, 12, 13, 14, 15, 16)
  ORDER BY id ASC
`

export async function queryAccounts(db: Queriable): Promise<RawAccount[]> {
	return db.query<RawAccount>(ACCOUNTS_SQL)
}
