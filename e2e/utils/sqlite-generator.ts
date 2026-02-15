import type { Sqlite3Static } from '@sqlite.org/sqlite-wasm'
import sqlite3InitModule from '@sqlite.org/sqlite-wasm'

const appleReferenceEpochMs = Date.UTC(2001, 0, 1, 0, 0, 0)

let sqlite3Promise: Promise<Sqlite3Static> | undefined

interface SQLiteFixtureOptions {
	transactions?: number
}

const getSqlite3 = (): Promise<Sqlite3Static> => {
	if (!sqlite3Promise) {
		sqlite3Promise = sqlite3InitModule()
	}
	return sqlite3Promise
}

export const generateSQLite = async (
	options: SQLiteFixtureOptions = {}
): Promise<Buffer> => {
	const transactionCount = Math.max(1, Math.trunc(options.transactions ?? 25))
	const sqlite3 = await getSqlite3()
	const db = new sqlite3.oo1.DB()

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

	db.exec(
		`INSERT INTO Z_PRIMARYKEY (Z_ENT, Z_NAME) VALUES
			(10, 'BankChequeAccount'),
			(19, 'Category'),
			(28, 'Payee'),
			(35, 'Tag'),
			(47, 'WithdrawTransaction')`
	)

	db.exec(
		`INSERT INTO ZSYNCOBJECT (
			Z_PK,
			Z_ENT,
			ZARCHIVED,
			ZNAME,
			ZCURRENCYNAME
		) VALUES (100, 10, 0, 'Wallet A', 'THB')`
	)
	db.exec(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2) VALUES
			(200, 19, 'Food and Beverage')`
	)
	db.exec(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME2, ZPARENTCATEGORY) VALUES
			(201, 19, 'Food', 200)`
	)
	db.exec(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME6) VALUES
			(300, 28, 'Local Shop')`
	)
	db.exec(
		`INSERT INTO ZSYNCOBJECT (Z_PK, Z_ENT, ZNAME6) VALUES
			(400, 35, 'Group: Test')`
	)
	db.exec(
		`INSERT INTO ZUSER (Z_PK, Z_ENT, ZSYNCUSERID, ZAPPSETTINGS, ZSYNCLOGIN)
		VALUES (1, 49, 1, NULL, 'fixture@example.com')`
	)
	db.exec(`INSERT INTO ZCOMMONSETTINGS (ZCURRENTUSER) VALUES (1)`)

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

		trxStatement
			.bind([
				id,
				date,
				amount,
				amount,
				`Lunch ${index + 1}`,
				`Memo ${index + 1}`,
			])
			.stepReset()
		categoryStatement.bind([id]).stepReset()
		if (index % 2 === 0) {
			tagStatement.bind([id]).stepReset()
		}
	}

	trxStatement.finalize()
	categoryStatement.finalize()
	tagStatement.finalize()

	const bytes = sqlite3.capi.sqlite3_js_db_export(db)
	db.close()
	return Buffer.from(bytes)
}
