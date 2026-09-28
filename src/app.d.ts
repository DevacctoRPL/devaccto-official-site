// See https://svelte.dev/docs/kit/types#app

// Minimal subset of the Cloudflare KV API that this project relies on.
// Declared locally so the project does not need @cloudflare/workers-types.
declare global {
	interface KVNamespaceListResult {
		keys: { name: string; expiration?: number; metadata?: unknown }[];
		list_complete: boolean;
		cursor?: string;
	}

	interface KVNamespaceLike {
		get(key: string, type?: 'text'): Promise<string | null>;
		get(key: string, type: 'json'): Promise<unknown | null>;
		put(
			key: string,
			value: string,
			options?: { expirationTtl?: number; metadata?: unknown }
		): Promise<void>;
		delete(key: string): Promise<void>;
		list(options?: {
			prefix?: string;
			limit?: number;
			cursor?: string;
		}): Promise<KVNamespaceListResult>;
	}

	namespace App {
		interface Platform {
			env: {
				/** KV namespace that stores the short links. */
				LINKS_KV?: KVNamespaceLike;
				/** Login code for /link. Falls back to 12345678 when unset. */
				LINK_ADMIN_CODE?: string;
				/** Secret used to sign the admin session cookie. */
				SESSION_SECRET?: string;
				/** Hostname that serves the short links. */
				SHORT_LINK_HOST?: string;
				/** Absolute URL of the main site. */
				MAIN_SITE_URL?: string;
			};
			context?: { waitUntil(promise: Promise<unknown>): void };
			caches?: unknown;
			cf?: unknown;
		}

		interface Locals {
			/** True when the request carries a valid /link admin session. */
			authed: boolean;
		}
	}
}

export {};
