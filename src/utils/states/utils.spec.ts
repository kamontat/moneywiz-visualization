import { describe, it, expect } from 'vitest'

import { copyState, mergeState } from './utils'

describe('copyState', () => {
	it('should create a deep copy of a simple object', () => {
		const original = { a: 1, b: 'test' }
		const copy = copyState(original)

		expect(copy).toEqual(original)
		expect(copy).not.toBe(original)
	})

	it('should create a deep copy of a nested object', () => {
		const original = {
			level1: {
				level2: {
					level3: {
						value: 'deep',
					},
				},
			},
		}
		const copy = copyState(original)

		expect(copy).toEqual(original)
		expect(copy).not.toBe(original)
		expect(copy.level1).not.toBe(original.level1)
		expect(copy.level1.level2).not.toBe(original.level1.level2)
		expect(copy.level1.level2.level3).not.toBe(original.level1.level2.level3)
	})

	it('should handle arrays in objects', () => {
		const original = {
			items: [1, 2, 3],
			nested: {
				arr: ['a', 'b', 'c'],
			},
		}
		const copy = copyState(original)

		expect(copy).toEqual(original)
		expect(copy.items).not.toBe(original.items)
		expect(copy.nested.arr).not.toBe(original.nested.arr)
	})

	it('should handle null and undefined values', () => {
		const original = {
			nullValue: null,
			undefinedValue: undefined,
			normalValue: 'test',
		}
		const copy = copyState(original)

		expect(copy).toEqual(original)
		expect(copy.nullValue).toBeNull()
		expect(copy.undefinedValue).toBeUndefined()
	})

	it('should handle Date objects', () => {
		const original = {
			timestamp: new Date('2023-01-01'),
		}
		const copy = copyState(original)

		expect(copy.timestamp).toEqual(original.timestamp)
		expect(copy.timestamp).not.toBe(original.timestamp)
	})

	it('should handle empty objects', () => {
		const original = {}
		const copy = copyState(original)

		expect(copy).toEqual({})
		expect(copy).not.toBe(original)
	})
})

describe('mergeState', () => {
	describe('basic merging', () => {
		it('should merge simple properties', () => {
			const base = { a: 1, b: 2 }
			const option = { b: 3, c: 4 }
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1, b: 3, c: 4 })
		})

		it('should not modify base object when copy=true (default)', () => {
			const base = { a: 1 }
			const option = { b: 2 } as any
			const result = mergeState(base, option)

			expect(base).toEqual({ a: 1 })
			expect(result).not.toBe(base)
		})

		it('should modify base object when copy=false', () => {
			const base = { a: 1 }
			const option = { b: 2 } as any
			const result = mergeState(base, option, undefined, false)

			expect(result).toBe(base)
			expect(result).toEqual({ a: 1, b: 2 })
		})

		it('should skip undefined and null values in option', () => {
			const base = { a: 1, b: 2, c: 3 }
			const option = { a: undefined, b: null as any, c: 4 }
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1, b: 2, c: 4 })
		})

		it('should handle empty option object', () => {
			const base = { a: 1 }
			const option = {}
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1 })
		})

		it('should handle empty base object', () => {
			const base = {}
			const option = { a: 1 }
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1 })
		})
	})

	describe('nested object merging', () => {
		it('should merge nested objects', () => {
			const base = {
				settings: {
					theme: 'dark',
					language: 'en',
				},
			}
			const option = {
				settings: {
					language: 'th',
				},
			}
			const result = mergeState(base, option)

			expect(result).toEqual({
				settings: {
					theme: 'dark',
					language: 'th',
				},
			})
		})

		it('should merge deeply nested objects (3 levels)', () => {
			const base = {
				level1: {
					level2: {
						level3: {
							value: 'original',
							keep: true,
						},
					},
				},
			}
			const option = {
				level1: {
					level2: {
						level3: {
							value: 'updated',
						},
					},
				},
			}
			const result = mergeState(base, option)

			expect(result).toEqual({
				level1: {
					level2: {
						level3: {
							value: 'updated',
							keep: true,
						},
					},
				},
			})
		})

		it('should handle mixed primitive and nested object updates', () => {
			const base = {
				name: 'test',
				config: {
					enabled: true,
					options: {
						flag: false,
					},
				},
			}
			const option = {
				name: 'updated',
				config: {
					options: {
						flag: true,
					},
				},
			}
			const result = mergeState(base, option)

			expect(result).toEqual({
				name: 'updated',
				config: {
					enabled: true,
					options: {
						flag: true,
					},
				},
			})
		})

		it('should not modify nested base objects when copy=true', () => {
			const base = {
				nested: {
					value: 1,
				},
			}
			const option = {
				nested: {
					value: 2,
				},
			}
			const result = mergeState(base, option)

			expect(base.nested.value).toBe(1)
			expect(result.nested.value).toBe(2)
			expect(result.nested).not.toBe(base.nested)
		})
	})

	describe('array merging', () => {
		it('should concatenate arrays when both are arrays', () => {
			const base = {
				items: [1, 2, 3],
			}
			const option = {
				items: [4, 5],
			}
			const result = mergeState(base, option)

			expect(result.items).toEqual([1, 2, 3, 4, 5])
		})

		it('should not concatenate when option array is empty', () => {
			const base = {
				items: [1, 2, 3],
			}
			const option = {
				items: [],
			}
			const result = mergeState(base, option)

			expect(result.items).toEqual([1, 2, 3])
		})

		it('should handle nested arrays', () => {
			const base = {
				data: {
					items: ['a', 'b'],
				},
			}
			const option = {
				data: {
					items: ['c'],
				},
			}
			const result = mergeState(base, option)

			expect(result.data.items).toEqual(['a', 'b', 'c'])
		})

		it('should replace non-array with option value when types differ', () => {
			const base = {
				value: 'string',
			}
			const option = {
				value: [1, 2, 3] as any,
			}
			const result = mergeState(base, option)

			expect(result.value).toEqual([1, 2, 3])
		})
	})

	describe('level limiting', () => {
		it('should stop merging at level 0', () => {
			const base = {
				nested: {
					value: 'original',
				},
			}
			const option = {
				nested: {
					value: 'updated',
				},
			}
			const result = mergeState(base, option, 0)

			expect(result).toEqual(base)
			expect(result).toBe(base)
		})

		it('should merge 1 level deep when level=1', () => {
			const base = {
				level1: {
					level2: {
						value: 'original',
					},
				},
			}
			const option = {
				level1: {
					level2: {
						value: 'updated',
					},
				},
			}
			const result = mergeState(base, option, 1)

			expect(result.level1).toBeDefined()
		})

		it('should merge 2 levels deep when level=2', () => {
			const base = {
				level1: {
					keep: 'this',
					level2: {
						level3: {
							value: 'original',
						},
					},
				},
			}
			const option = {
				level1: {
					level2: {
						level3: {
							value: 'updated',
						},
					},
				},
			}
			const result = mergeState(base, option, 2)

			expect(result.level1.keep).toBe('this')
			expect(result.level1.level2).toBeDefined()
		})

		it('should handle undefined level (no limit)', () => {
			const base = {
				level1: {
					level2: {
						level3: {
							level4: {
								value: 'original',
							},
						},
					},
				},
			}
			const option = {
				level1: {
					level2: {
						level3: {
							level4: {
								value: 'updated',
							},
						},
					},
				},
			}
			const result = mergeState(base, option, undefined)

			expect(result.level1.level2.level3.level4.value).toBe('updated')
		})
	})

	describe('edge cases', () => {
		it('should handle null base', () => {
			const base = null as any
			const option = { a: 1 }
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1 })
		})

		it('should handle primitive base', () => {
			const base = 'string' as any
			const option = { a: 1 }
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1 })
		})

		it('should handle number base', () => {
			const base = 123 as any
			const option = { a: 1 }
			const result = mergeState(base, option)

			expect(result).toEqual({ a: 1 })
		})

		it('should only update changed values', () => {
			const base = {
				unchanged: 'same',
				changed: 'old',
			}
			const option = {
				changed: 'new',
			}
			const result = mergeState(base, option)

			expect(result).toEqual({
				unchanged: 'same',
				changed: 'new',
			})
		})

		it('should handle complex nested merge scenario', () => {
			const base = {
				user: {
					name: 'John',
					settings: {
						theme: 'dark',
						notifications: {
							email: true,
							push: false,
						},
					},
					tags: ['admin', 'user'],
				},
				app: {
					version: '1.0.0',
				},
			}
			const option = {
				user: {
					settings: {
						notifications: {
							push: true,
						},
					},
					tags: ['developer'],
				},
			}
			const result = mergeState(base, option)

			expect(result).toEqual({
				user: {
					name: 'John',
					settings: {
						theme: 'dark',
						notifications: {
							email: true,
							push: true,
						},
					},
					tags: ['admin', 'user', 'developer'],
				},
				app: {
					version: '1.0.0',
				},
			})
		})
	})
})
