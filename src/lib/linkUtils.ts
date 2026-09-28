import type { LinkRecord } from '$lib/types';

/** Slugs: 1-64 chars, lowercase letters, digits, dashes and underscores. */
export const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$/;

/** Slugs that would clash with infrastructure or confuse visitors. */
export const RESERVED_SLUGS = new Set([
	'api',
	'admin',
	'login',
	'logout',
	'link',
	'links',
	'app',
	'assets',
	'favicon.ico',
	'robots.txt',
	'sitemap.xml',
	'health'
]);

export function normalizeSlug(input: string): string {
	return input.trim().toLowerCase();
}

/** Returns an error message, or null when the slug is usable. */
export function validateSlug(input: string): string | null {
	const slug = normalizeSlug(input);
	if (!slug) return 'Slug wajib diisi.';
	if (slug.length > 64) return 'Slug maksimal 64 karakter.';
	if (!SLUG_PATTERN.test(slug)) {
		return 'Slug hanya boleh berisi huruf kecil, angka, tanda hubung, dan garis bawah.';
	}
	if (RESERVED_SLUGS.has(slug)) return `Slug "${slug}" tidak boleh dipakai.`;
	return null;
}

/** Accepts bare domains too and normalises them to https://. */
export function normalizeUrl(input: string): string | null {
	const raw = input.trim();
	if (!raw) return null;

	const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
		? raw
		: /^(mailto:|tel:)/i.test(raw)
			? raw
			: `https://${raw}`;

	try {
		const url = new URL(candidate);
		const allowed = ['http:', 'https:', 'mailto:', 'tel:'];
		if (!allowed.includes(url.protocol)) return null;
		return url.toString();
	} catch {
		return null;
	}
}

export function isExpired(record: Pick<LinkRecord, 'expiresAt'>, now = Date.now()): boolean {
	const expiresAt = record.expiresAt ?? null;
	return expiresAt !== null && expiresAt <= now;
}

/** True when a stored record may be served. */
export function isServable(record: LinkRecord, now = Date.now()): boolean {
	return record.active && !isExpired(record, now);
}

/** Converts a `YYYY-MM-DD` form value into end-of-day epoch ms. */
export function parseExpiry(input: string | null | undefined): number | null {
	const raw = (input ?? '').trim();
	if (!raw) return null;

	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
	if (!match) return null;

	const [, year, month, day] = match;
	const date = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
	return Number.isNaN(date.getTime()) ? null : date.getTime();
}

/** Formats epoch ms as `YYYY-MM-DD` for a date input. */
export function formatExpiry(value: number | null | undefined): string {
	if (value === null || value === undefined) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${date.getFullYear()}-${month}-${day}`;
}

/** Shape returned to the client, with `expiresAtInput` ready for a date field. */
export interface LinkListItem extends LinkRecord {
	expiresAtInput: string;
	expired: boolean;
}
