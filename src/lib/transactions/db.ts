import { db } from '$lib/loggers'

export const initTransactionStorage = () => {
	const log = db.extends('transactions')
	// TODO: implement transaction storage initialization
	log.debug('transaction storage initialized')
}
