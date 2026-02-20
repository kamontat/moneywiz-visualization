import { Database } from 'bun:sqlite'

const APPLE_REFERENCE_EPOCH_MS = Date.UTC(2001, 0, 1, 0, 0, 0)

export interface MoneyWizRecord {
	payee?: string
	category?: string
	parentCategory?: string
	description?: string
	date?: Date
	amount?: number
	currency?: string
	isIncome?: boolean
}

export interface SQLiteFixtureOptions {
	transactions?: MoneyWizRecord[]
}

const toCoreDataTimestamp = (date: Date): number =>
	(date.getTime() - APPLE_REFERENCE_EPOCH_MS) / 1000

export const defaultRecord: MoneyWizRecord = {
	payee: 'Local Shop',
	category: 'Food',
	parentCategory: 'Food and Beverage',
	description: 'Lunch 1',
	date: new Date(Date.UTC(2026, 0, 1)),
	amount: -100,
	currency: 'THB',
}

export const generateSQLite = (options: SQLiteFixtureOptions = {}): Buffer => {
	const records = options.transactions ?? [defaultRecord]
	const db = new Database(':memory:')

	db.exec(`
		CREATE TABLE Z_PRIMARYKEY (
			Z_ENT INTEGER,
			Z_NAME TEXT
		);
		CREATE TABLE ZSYNCOBJECT (
			Z_PK INTEGER PRIMARY KEY,
			Z_ENT INTEGER,
			ZARCHIVED INTEGER,
			ZNAME TEXT,
			ZNAME1 TEXT,
			ZNAME2 TEXT,
			ZNAME3 TEXT,
			ZNAME4 TEXT,
			ZNAME5 TEXT,
			ZNAME6 TEXT,
			ZCURRENCYNAME TEXT,
			ZCURRENCYNAME1 TEXT,
			ZCURRENCYNAME2 TEXT,
			ZCURRENCYNAME3 TEXT,
			ZPARENTCATEGORY INTEGER,
			ZDATE REAL,
			ZDATE1 REAL,
			ZAMOUNT REAL,
			ZAMOUNT1 REAL,
			ZORIGINALAMOUNT REAL,
			ZORIGINALSENDERAMOUNT REAL,
			ZORIGINALRECIPIENTAMOUNT REAL,
			ZORIGINALCURRENCY TEXT,
			ZORIGINALSENDERCURRENCY TEXT,
			ZORIGINALRECIPIENTCURRENCY TEXT,
			ZACCOUNT INTEGER,
			ZACCOUNT1 INTEGER,
			ZACCOUNT2 INTEGER,
			Z9_ACCOUNT INTEGER,
			Z9_ACCOUNT1 INTEGER,
			Z9_ACCOUNT2 INTEGER,
			ZSENDERACCOUNT INTEGER,
			Z9_SENDERACCOUNT INTEGER,
			ZRECIPIENTACCOUNT INTEGER,
			ZRECIPIENTACCOUNT1 INTEGER,
			Z9_RECIPIENTACCOUNT INTEGER,
			Z9_RECIPIENTACCOUNT1 INTEGER,
			ZPAYEE INTEGER,
			ZPAYEE1 INTEGER,
			ZPAYEE2 INTEGER,
			ZDESC TEXT,
			ZDESC1 TEXT,
			ZDESC2 TEXT,
			ZNOTES TEXT,
			ZNOTES1 TEXT,
			ZSTATUS INTEGER,
			ZSTATUS1 INTEGER,
			ZRECONCILED INTEGER
		);
		CREATE TABLE ZCATEGORYASSIGMENT (
			ZTRANSACTION INTEGER,
			ZCATEGORY INTEGER
		);
		CREATE TABLE ZUSER (
			Z_PK INTEGER PRIMARY KEY,
			Z_ENT INTEGER,
			ZSYNCUSERID INTEGER,
			ZAPPSETTINGS INTEGER,
			ZSYNCLOGIN TEXT
		);
		CREATE TABLE ZCOMMONSETTINGS (
			ZCURRENTUSER INTEGER
		);
		CREATE TABLE Z_36TAGS (
			Z_36TRANSACTIONS INTEGER,
			Z_35TAGS INTEGER
		);
	`)

	db.exec(`
		INSERT INTO Z_PRIMARYKEY (Z_ENT, Z_NAME) VALUES
			(10, 'BankChequeAccount'),
			(19, 'Category'),
			(28, 'Payee'),
			(35, 'Tag'),
			(37, 'DepositTransaction'),
			(47, 'WithdrawTransaction');
		INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZARCHIVED, ZNAME, ZCURRENCYNAME)
			VALUES (100, 10, 0, 'Wallet A', 'THB');
		INSERT INTO ZUSER (Z_PK, Z_ENT, ZSYNCUSERID, ZAPPSETTINGS, ZSYNCLOGIN)
			VALUES (1, 49, 1, NULL, 'fixture@example.com');
		INSERT INTO ZCOMMONSETTINGS (ZCURRENTUSER) VALUES (1);
	`)

	const payeeIds = new Map<string, number>()
	const categoryIds = new Map<string, number>()
	const parentCategoryIds = new Map<string, number>()
	let nextId = 200

	const getOrCreatePayee = (name: string): number => {
		if (payeeIds.has(name)) return payeeIds.get(name)!
		const id = nextId++
		db.run('INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME6) VALUES (?, 28, ?)', [
			id,
			name,
		])
		payeeIds.set(name, id)
		return id
	}

	const getOrCreateCategory = (name: string, parentName?: string): number => {
		const key = parentName ? `${parentName}>${name}` : name
		if (categoryIds.has(key)) return categoryIds.get(key)!

		let parentId: number | undefined
		if (parentName) {
			if (!parentCategoryIds.has(parentName)) {
				const pid = nextId++
				db.run(
					'INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2) VALUES (?, 19, ?)',
					[pid, parentName]
				)
				parentCategoryIds.set(parentName, pid)
			}
			parentId = parentCategoryIds.get(parentName)
		}

		const id = nextId++
		if (parentId !== undefined) {
			db.run(
				'INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2, ZPARENTCATEGORY) VALUES (?, 19, ?, ?)',
				[id, name, parentId]
			)
		} else {
			db.run(
				'INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2) VALUES (?, 19, ?)',
				[id, name]
			)
		}
		categoryIds.set(key, id)
		return id
	}

	const insertTrx = db.prepare(
		`INSERT INTO ZSYNCOBJECT (
			Z_PK, Z_ENT, ZDATE1, ZAMOUNT1, ZORIGINALAMOUNT, ZORIGINALCURRENCY,
			ZACCOUNT2, ZPAYEE2, ZDESC2, ZNOTES1, ZSTATUS1, ZRECONCILED
		) VALUES (?, ?, ?, ?, ?, ?, 100, ?, ?, '', 2, 1)`
	)
	const insertCat = db.prepare(
		'INSERT INTO ZCATEGORYASSIGMENT (ZTRANSACTION, ZCATEGORY) VALUES (?, ?)'
	)

	for (let i = 0; i < records.length; i++) {
		const rec = records[i]
		const id = nextId++
		const date = toCoreDataTimestamp(
			rec.date ?? new Date(Date.UTC(2026, 0, i + 1))
		)
		const amount = rec.amount ?? -100
		const currency = rec.currency ?? 'THB'
		const entityId = amount >= 0 ? 37 : 47
		const payeeId = getOrCreatePayee(rec.payee ?? 'Test Payee')

		insertTrx.run(
			id,
			entityId,
			date,
			amount,
			amount,
			currency,
			payeeId,
			rec.description ?? `Transaction ${i + 1}`
		)

		if (rec.category) {
			const catId = getOrCreateCategory(rec.category, rec.parentCategory)
			insertCat.run(id, catId)
		}
	}

	const bytes = db.serialize()
	db.close()
	return Buffer.from(bytes)
}
