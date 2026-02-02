/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Debugger } from 'debug'
import createDebug from 'debug'

type Namespace<
	T extends string,
	S extends string[],
	SEP extends string,
> = S extends [infer F extends string, ...infer R extends string[]]
	? Namespace<`${T}${SEP}${F}`, R, SEP>
	: T

export class Log<T extends string, SEP extends string> {
	private static app = 'moneywiz' as const

	public static separator = ':' as const
	public static root = new Log<typeof Log.app, typeof Log.separator>(Log.app)

	private _log: Debugger
	private _debug?: Debugger
	private _info?: Debugger
	private _warn?: Debugger
	private _error?: Debugger

	private constructor(...namespaces: T[]) {
		const ns = namespaces.join(Log.separator)
		this._log = createDebug(ns)
		this._debug = this._log.extend('debug')
		this._info = this._log.extend('info')
		this._warn = this._log.extend('warn')
		this._error = this._log.extend('error')
	}

	extends<S extends string[]>(
		...namespaces: S
	): Log<Namespace<T, S, SEP>, SEP> {
		return new Log([this._log.namespace, ...namespaces].join(Log.separator))
	}

	debug(formatter: any, ...args: any[]): void {
		this.getDebug()(formatter, ...args)
	}

	info(formatter: any, ...args: any[]): void {
		this.getInfo()(formatter, ...args)
	}

	warn(formatter: any, ...args: any[]): void {
		this.getWarn()(formatter, ...args)
	}

	error(formatter: any, ...args: any[]): void {
		this.getError()(formatter, ...args)
	}

	log(formatter: any, ...args: any[]): void {
		this._log(formatter, ...args)
	}

	private getDebug(): Debugger {
		if (!this._debug) this._debug = this._log.extend('debug')
		return this._debug
	}

	private getInfo(): Debugger {
		if (!this._info) this._info = this._log.extend('info')
		return this._info
	}

	private getWarn(): Debugger {
		if (!this._warn) this._warn = this._log.extend('warn')
		return this._warn
	}

	private getError(): Debugger {
		if (!this._error) this._error = this._log.extend('error')
		return this._error
	}
}
