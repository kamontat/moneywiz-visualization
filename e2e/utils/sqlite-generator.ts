import type { SqlJsStatic } from 'sql.js/dist/sql-wasm.js'
import { createRequire } from 'node:module'

import initSqlJs from 'sql.js/dist/sql-wasm.js'

const require = createRequire(import.meta.url)
const appleReferenceEpochMs = Date.UTC(2001, 0, 1, 0, 0, 0)

let sqlEnginePromise: Promise<SqlJsStatic> | undefined

interface SQLiteFixtureOptions {
	transactions?: number
}

const getSqlEngine = async (): Promise<SqlJsStatic> => {
	if (!sqlEnginePromise) {
		const wasmPath = require.resolve('sql.js/dist/sql-wasm.wasm')
		sqlEnginePromise = initSqlJs({
			locateFile: () => wasmPath,
		})
	}
	return sqlEnginePromise
}

export const generateSQLite = async (
	options: SQLiteFixtureOptions = {}
): Promise<Buffer> => {
	const transactionCount = Math.max(1, Math.trunc(options.transactions ?? 25))
	const sql = await getSqlEngine()
	const db = new sql.Database()

	db.run(`
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

	db.run(
		`INSERT INTO Z_PRIMARYKEY (Z_ENT, Z_NAME) VALUES
			(10, 'BankChequeAccount'),
			(19, 'Category'),
			(28, 'Payee'),
			(35, 'Tag'),
			(47, 'WithdrawTransaction')`
	)

	db.run(
		`INSERT INTO ZSYNCOBJECT (
			Z_PK,
			Z_ENT,
			ZARCHIVED,
			ZNAME,
			ZCURRENCYNAME
		) VALUES (100, 10, 0, 'Wallet A', 'THB')`
	)
	db.run(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2) VALUES
			(200, 19, 'Food and Beverage')`
	)
	db.run(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2, ZPARENTCATEGORY) VALUES
			(201, 19, 'Food', 200)`
	)
	db.run(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME6) VALUES
			(300, 28, 'Local Shop')`
	)
	db.run(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME6) VALUES
			(400, 35, 'Group: Test')`
	)
	db.run(
		`INSERT INTO ZUSER (Z_PK, Z_ENT, ZSYNCUSERID, ZAPPSETTINGS, ZSYNCLOGIN)
		VALUES (1, 49, 1, NULL, 'fixture@example.com')`
	)
	db.run(`INSERT INTO ZCOMMONSETTINGS (ZCURRENTUSER) VALUES (1)`)

	const baseDateSeconds = Math.floor(
		(Date.UTC(2026, 0, 1, 0, 0, 0) - appleReferenceEpochMs) / 1000
	)

	const trxStatement = db.prepare(
		`INSERT INTO ZSYNCOBJECT (
			Z_PK,
			Z_ENT,
			ZDATE1,
			ZAMOUNT1,
			ZORIGINALAMOUNT,
			ZORIGINALCURRENCY,
			ZACCOUNT2,
			ZPAYEE2,
			ZDESC2,
			ZNOTES1,
			ZSTATUS1,
			ZRECONCILED
		) VALUES (?, 47, ?, ?, ?, 'THB', 100, 300, ?, ?, 2, 1)`
	)
	const categoryStatement = db.prepare(
		`INSERT INTO ZCATEGORYASSIGMENT (ZTRANSACTION, ZCATEGORY) VALUES (?, 201)`
	)
	const tagStatement = db.prepare(
		`INSERT INTO Z_36TAGS (Z_36TRANSACTIONS, Z_35TAGS) VALUES (?, 400)`
	)

	for (let index = 0; index < transactionCount; index += 1) {
		const id = 500 + index
		const date = baseDateSeconds + index * 86400
		const amount = -100 - index

		trxStatement.run([
			id,
			date,
			amount,
			amount,
			`Lunch ${index + 1}`,
			`Memo ${index + 1}`,
		])
		categoryStatement.run([id])
		if (index % 2 === 0) {
			tagStatement.run([id])
		}
	}

	trxStatement.free()
	categoryStatement.free()
	tagStatement.free()

	const bytes = db.export()
	db.close()
	return Buffer.from(bytes)
}
