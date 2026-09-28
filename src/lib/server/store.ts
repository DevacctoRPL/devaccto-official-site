import type { LinkRecord } from '$lib/types';

const KEY_PREFIX = 'link:';
const LIST_PAGE_SIZE = 1000;
const MAX_LISTED_KEYS = 2000;

export interface LinkStore {
	list(): Promise<LinkRecord[]>;
	get(slug: string): Promise<LinkRecord | null>;
	save(record: LinkRecord): Promise<void>;
	remove(slug: string): Promise<void>;
	incrementClicks(slug: string): Promise<void>;
}

/** True when redirects and CRUD will survive a redeploy. */
export function isPersistentStore(kv?: KVNamespaceLike): boolean {
	return Boolean(kv);
}

class KvLinkStore implements LinkStore {
	constructor(private readonly kv: KVNamespaceLike) {}

	private key(slug: string): string {
		return `${KEY_PREFIX}${slug}`;
	}

	async list(): Promise<LinkRecord[]> {
		const records: LinkRecord[] = [];
		let cursor: string | undefined;
		let seen = 0;

		do {
			const page = await this.kv.list({ prefix: KEY_PREFIX, limit: LIST_PAGE_SIZE, cursor });
			const batch = await Promise.all(
				page.keys.map((key) => this.kv.get(key.name, 'json') as Promise<LinkRecord | null>)
			);
			for (const record of batch) {
				if (record) records.push(record);
			}
			seen += page.keys.length;
			cursor = page.list_complete ? undefined : page.cursor;
		} while (cursor && seen < MAX_LISTED_KEYS);

		return records.sort((a, b) => b.createdAt - a.createdAt);
	}

	async get(slug: string): Promise<LinkRecord | null> {
		return (await this.kv.get(this.key(slug), 'json')) as LinkRecord | null;
	}

	async save(record: LinkRecord): Promise<void> {
		await this.kv.put(this.key(record.slug), JSON.stringify(record));
	}

	async remove(slug: string): Promise<void> {
		await this.kv.delete(this.key(slug));
	}

	async incrementClicks(slug: string): Promise<void> {
		const record = await this.get(slug);
		if (!record) return;
		// KV has no atomic increment. Concurrent redirects can lose a click or two,
		// which is acceptable for this use case.
		await this.save({ ...record, clicks: (record.clicks ?? 0) + 1 });
	}
}

/**
 * Development fallback so `npm run dev` works without a KV binding.
 * Backed by `globalThis` so the data survives Vite hot reloads.
 */
class MemoryLinkStore implements LinkStore {
	private readonly map: Map<string, LinkRecord>;

	constructor(map: Map<string, LinkRecord>) {
		this.map = map;
	}

	async list(): Promise<LinkRecord[]> {
		return [...this.map.values()].sort((a, b) => b.createdAt - a.createdAt);
	}

	async get(slug: string): Promise<LinkRecord | null> {
		return this.map.get(slug) ?? null;
	}

	async save(record: LinkRecord): Promise<void> {
		this.map.set(record.slug, { ...record });
	}

	async remove(slug: string): Promise<void> {
		this.map.delete(slug);
	}

	async incrementClicks(slug: string): Promise<void> {
		const record = this.map.get(slug);
		if (record) this.map.set(slug, { ...record, clicks: (record.clicks ?? 0) + 1 });
	}
}

const globalScope = globalThis as typeof globalThis & {
	__devacctoLinkStore?: Map<string, LinkRecord>;
};

export function getStore(kv?: KVNamespaceLike): LinkStore {
	if (kv) return new KvLinkStore(kv);
	globalScope.__devacctoLinkStore ??= new Map<string, LinkRecord>();
	return new MemoryLinkStore(globalScope.__devacctoLinkStore);
}

/** Convenience helper for route handlers. */
export function getStoreFor(platform?: App.Platform | null): LinkStore {
	return getStore(platform?.env?.LINKS_KV);
}
