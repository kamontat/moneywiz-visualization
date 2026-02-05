import type { State } from './models'
import type { AnyRecord, DeepPartial } from '$utils/types'
import { mergeState } from './utils'

const defaultEqual = <S>(a: S, b: S) => a === b

const defaultMerge = <S>(s: S, p: Partial<S>) =>
	mergeState(s as AnyRecord, p as DeepPartial<AnyRecord>, 1, false) as S

const defaultNormalize = <S>(p: S | Partial<S>) =>
	mergeState({} as AnyRecord, p as DeepPartial<AnyRecord>, 1, false) as S

export const newState = <S>(
	empty: S,
	state: Omit<Partial<State<S>>, 'empty'>
): State<S> => {
	return {
		empty,
		equal: state.equal ?? defaultEqual,
		merge: state.merge ?? defaultMerge,
		normalize: state.normalize ?? defaultNormalize,
	}
}

export const newEmptyState = <S>(empty: S): S => empty
