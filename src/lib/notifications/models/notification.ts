export type NotificationVariant =
	| 'plain'
	| 'info'
	| 'success'
	| 'warning'
	| 'error'

export interface Notification {
	id: string
	variant: NotificationVariant
	text: string
}

export interface CreateNotification {
	variant: NotificationVariant
	text: string
}
