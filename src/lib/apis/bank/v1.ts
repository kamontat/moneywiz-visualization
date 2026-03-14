import type {
	CurrencyConverter,
	RateProviderOptions,
} from './currency/types.js'
import { createCurrencyConverter } from './currency/index.js'

export interface BankApiV1 {
	readonly currency: CurrencyConverter
}

export const createBankApi = (options?: RateProviderOptions): BankApiV1 => ({
	currency: createCurrencyConverter(options),
})
