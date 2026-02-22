import type { CreateNotification, Notification } from './models'
import { writable } from 'svelte/store'

import { component } from '$lib/loggers'

const MAX_NOTIFICATIONS = 20
const log = component.extends('notifications')

const notifications = writable<Notification[]>([])

let sequence = 0

const createNotificationId = () => {
	sequence += 1
	return `${Date.now()}-${sequence}`
}

export const notificationsStore = {
	subscribe: notifications.subscribe,
}

export const pushNotification = (next: CreateNotification): string => {
	const id = createNotificationId()

	notifications.update((current) => {
		const updated = [{ id, variant: next.variant, text: next.text }, ...current]
		return updated.slice(0, MAX_NOTIFICATIONS)
	})

	log.info('notification pushed: [%s] %s', next.variant, next.text)
	return id
}

export const dismissNotification = (id?: string) => {
	if (!id) return

	notifications.update((current) => {
		const updated = current.filter((message) => message.id !== id)
		if (updated.length !== current.length) {
			log.debug('notification dismissed: %s', id)
		}
		return updated
	})
}

export const clearNotifications = () => {
	notifications.set([])
	log.debug('all notifications cleared')
}
