---
name: web-unit-tester
description: Write and run unit tests for MoneyWiz. Use when testing business logic (src/lib/), verifying isolated Svelte component interactions, or debugging pure logic errors using Vitest.
---

## Commands

- `bun run test`: Run all unit tests.

## Writing Tests

- **Location**: Co-located with source (`foo.ts` -> `foo.spec.ts`).
- **Framework**: Vitest (Jest-like API).

### Logic Example

```typescript
import { add } from './math'
import { describe, it, expect } from 'vitest'

describe('math', () => {
	it('adds', () => {
		expect(add(1, 1)).toBe(2)
	})
})
```

### Component Example

```typescript
import { render, screen } from '@testing-library/svelte'
import Button from './Button.svelte'

it('renders', () => {
	render(Button, { label: 'Click me' })
	expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```
