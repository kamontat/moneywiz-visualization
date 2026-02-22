import { get } from 'svelte/store'
import { beforeEach, describe, expect, it } from 'vitest'

import {
	clearNotifications,
	dismissNotification,
	notificationsStore,
	pushNotification,
} from './store'

describe('notifications store', () => {
	beforeEach(() => {
		clearNotifications()
	})

	it('pushes notifications to the front', () => {
		pushNotification({
			variant: 'info',
			text: 'first',
		})
		pushNotification({
			variant: 'error',
			text: 'second',
		})

		const messages = get(notificationsStore)
		expect(messages).toHaveLength(2)
		expect(messages[0]?.text).toBe('second')
		expect(messages[1]?.text).toBe('first')
	})

	it('dismisses notification by id', () => {
		const id = pushNotification({
			variant: 'success',
			text: 'done',
		})

		dismissNotification(id)

		expect(get(notificationsStore)).toHaveLength(0)
	})

	it('keeps only latest 20 notifications', () => {
		for (let index = 1; index <= 25; index += 1) {
			pushNotification({
				variant: 'info',
				text: `message-${index}`,
			})
		}

		const messages = get(notificationsStore)
		expect(messages).toHaveLength(20)
		expect(messages[0]?.text).toBe('message-25')
		expect(messages[19]?.text).toBe('message-6')
	})
})
