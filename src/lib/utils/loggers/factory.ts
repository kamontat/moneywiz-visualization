import debug from 'debug'

export interface Logger {
	readonly namespace: string
	extends(...ns: string[]): Logger
	debug(formatter: string, ...args: unknown[]): void
	info(formatter: string, ...args: unknown[]): void
	warn(formatter: string, ...args: unknown[]): void
	error(formatter: string, ...args: unknown[]): void
}

class DebugLogger implements Logger {
	private readonly _debug: debug.Debugger
	private readonly _info: debug.Debugger
	private readonly _warn: debug.Debugger
	private readonly _error: debug.Debugger

	constructor(readonly namespace: string) {
		this._debug = debug(`${namespace}:debug`)
		this._info = debug(`${namespace}:info`)
		this._warn = debug(`${namespace}:warn`)
		this._error = debug(`${namespace}:error`)
	}

	extends(...ns: string[]): Logger {
		const joined = ns.join(':')
		return new DebugLogger(`${this.namespace}:${joined}`)
	}

	debug(formatter: string, ...args: unknown[]): void {
		this._debug(formatter, ...args)
	}

	info(formatter: string, ...args: unknown[]): void {
		this._info(formatter, ...args)
	}

	warn(formatter: string, ...args: unknown[]): void {
		this._warn(formatter, ...args)
	}

	error(formatter: string, ...args: unknown[]): void {
		this._error(formatter, ...args)
	}
}

export class LoggerFactory {
	static create(...ns: string[]): Logger {
		const namespace = ns.join(':')
		return new DebugLogger(namespace)
	}
}
