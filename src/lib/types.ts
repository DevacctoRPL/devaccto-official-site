/** A single short link, stored under its slug. */
export interface LinkRecord {
	/** The path segment, e.g. `abc123` for https://to.devaccto-rpl.web.id/abc123 */
	slug: string;
	/** Destination URL. Always absolute http(s). */
	url: string;
	/** Optional human readable label. */
	title: string;
	/** Unix epoch in milliseconds. */
	createdAt: number;
	/** Unix epoch in milliseconds. */
	updatedAt: number;
	/** Number of recorded redirects. */
	clicks: number;
	/** When false the slug returns 404 without redirecting. */
	active: boolean;
	/** When true redirects use 301 instead of 302. */
	permanent: boolean;
	/** Optional expiry, unix epoch in milliseconds. */
	expiresAt: number | null;
}
