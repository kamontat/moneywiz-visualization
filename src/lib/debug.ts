import createDebug from 'debug';

/**
 * Debug namespace hierarchy for MoneyWiz Visualization.
 *
 * Usage:
 *   DEBUG=moneywiz:* bun run dev       # Enable all logs
 *   DEBUG=moneywiz:csv bun run dev     # CSV parser only
 *   DEBUG=moneywiz:store:* bun run dev # All store logs
 *
 * Browser:
 *   localStorage.debug = 'moneywiz:*'  # Enable all MoneyWiz logs
 *   localStorage.debug = 'moneywiz:csv' # CSV parser only
 *   localStorage.debug = '*'           # Enable ALL debug logs (includes 3rd-party)
 *
 * Available namespaces:
 *   moneywiz:csv            - CSV parsing operations
 *   moneywiz:store          - Store operations
 *   moneywiz:store:csv      - CSV store updates
 *   moneywiz:component      - Component lifecycle
 *   moneywiz:component:upload - Upload button interactions
 *   moneywiz:page           - Page/route operations
 *   moneywiz:page:dashboard - Dashboard rendering
 *   moneywiz:fetch          - Data fetching
 */

const APP_NAMESPACE = 'moneywiz';

type DebugFn = ReturnType<typeof createDebug>;

/**
 * Logger builder with fluent API for creating namespaced debug loggers.
 *
 * @example
 * const log = createLogger('csv').build();
 * log('parsing file: %s', filename);
 *
 * @example
 * const log = createLogger('store').sub('csv').build();
 * log('store updated'); // moneywiz:store:csv
 */
class LoggerBuilder {
	private segments: string[] = [];

	constructor(initial?: string) {
		if (initial) {
			this.segments.push(initial);
		}
	}

	/** Add a sub-namespace segment */
	sub(namespace: string): this {
		this.segments.push(namespace);
		return this;
	}

	/** Build the final debug function */
	build(): DebugFn {
		const fullNamespace = [APP_NAMESPACE, ...this.segments].join(':');
		return createDebug(fullNamespace);
	}
}

/** Create a namespaced logger builder */
export function createLogger(namespace: string): LoggerBuilder {
	return new LoggerBuilder(namespace);
}

// Pre-built loggers for common modules
export const log = {
	/** CSV parsing operations */
	csv: createLogger('csv').build(),

	/** Store operations */
	store: createLogger('store').build(),
	/** CSV store updates */
	storeCsv: createLogger('store').sub('csv').build(),

	/** Component lifecycle and interactions */
	component: createLogger('component').build(),
	/** Upload button interactions */
	componentUpload: createLogger('component').sub('upload').build(),

	/** Page/route operations */
	page: createLogger('page').build(),
	/** Dashboard rendering and calculations */
	pageDashboard: createLogger('page').sub('dashboard').build(),

	/** Data fetching */
	fetch: createLogger('fetch').build()
};

export default log;
