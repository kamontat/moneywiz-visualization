import type { CurrencyConverter, RateProviderOptions } from './currency/types'
import { createCurrencyConverter } from './currency'

export interface BankApiV1 {
	readonly currency: CurrencyConverter
}

export const createBankApi = (options?: RateProviderOptions): BankApiV1 => ({
	currency: createCurrencyConverter(options),
})
