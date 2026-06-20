export interface LiteAdapter {
	query: (sql: string) => Promise<unknown>
}

export function createLiteAdapter(adapter: LiteAdapter) {
	return adapter
}
