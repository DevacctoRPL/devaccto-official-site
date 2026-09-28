import type { Handle } from '@sveltejs/kit';
import { getConfig, matchesShortHost, type AppConfig } from '$lib/server/config';
import { SESSION_COOKIE, verifySessionToken } from '$lib/server/auth';
import { getStoreFor } from '$lib/server/store';
import { isServable, normalizeSlug, SLUG_PATTERN } from '$lib/linkUtils';

/** Slugs the short-link host refuses to redirect, to avoid self-referential loops. */
const BLOCKED_SLUGS = new Set(['link', 'links', 'login', 'logout', 'api', 'admin']);

/** Small standalone error page for the short-link host. */
function page(config: AppConfig, status: number, message: string): Response {
	const body = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${status} · ${escapeHtml(config.shortHost)}</title>
<style>
:root { color-scheme: light dark; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #262B43; color: #fff; font-family: 'Space Grotesk', system-ui, sans-serif; }
main { text-align: center; padding: 2rem; }
h1 { font-size: 4rem; margin: 0; letter-spacing: -0.04em; }
p { color: #D3D3D3; margin: 0.75rem 0 1.5rem; }
code { color: #62929A; }
a { color: #62929A; text-decoration: none; border: 1px solid #62929A; padding: 0.6rem 1.2rem; border-radius: 9999px; display: inline-block; }
a:hover { background: #62929A; color: #fff; }
</style>
</head>
<body>
<main>
<h1>${status}</h1>
<p>${message}</p>
<a href="${escapeHtml(config.mainUrl)}">devaccto-rpl.web.id</a>
</main>
</body>
</html>`;

	return new Response(body, {
		status,
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex'
		}
	});
}

function redirectResponse(target: string, permanent: boolean): Response {
	return new Response(null, {
		status: permanent ? 301 : 302,
		headers: {
			location: target,
			// Keep edits instant; a cached 302/301 would pin visitors to a stale
			// destination. Flip this if a slug is meant to be immutable.
			'cache-control': 'no-store',
			'x-robots-tag': 'noindex'
		}
	});
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Handles every request whose Host matches the short-link hostname. */
async function handleShortHost(event: Parameters<Handle>[0]['event'], config: AppConfig) {
	const { pathname } = event.url;

	// Short links are private by nature: keep them out of search indexes.
	if (pathname === '/robots.txt') {
		return new Response('User-agent: *\nDisallow: /\n', {
			headers: { 'content-type': 'text/plain; charset=utf-8' }
		});
	}

	let decoded: string;
	try {
		decoded = decodeURIComponent(pathname);
	} catch {
		return page(config, 404, 'Alamat tidak valid.');
	}

	const slug = normalizeSlug(decoded.replace(/^\/+|\/+$/g, ''));

	// Root of the short host: send visitors to the main site.
	if (!slug) {
		return redirectResponse(config.mainUrl, false);
	}

	// Only a single path segment maps to a slug.
	if (slug.includes('/') || BLOCKED_SLUGS.has(slug) || !SLUG_PATTERN.test(slug)) {
		return page(config, 404, `Slug <code>${escapeHtml(slug)}</code> tidak dikenali.`);
	}

	const store = getStoreFor(event.platform);
	const record = await store.get(slug);

	if (!record) {
		return page(config, 404, `Link <code>${escapeHtml(slug)}</code> tidak ditemukan.`);
	}

	if (!isServable(record)) {
		return page(config, 410, `Link <code>${escapeHtml(slug)}</code> sudah tidak aktif.`);
	}

	// Click counting is best-effort: never make the visitor wait for it.
	const counted = store.incrementClicks(slug).catch(() => undefined);
	if (event.platform?.context?.waitUntil) {
		event.platform.context.waitUntil(counted);
	} else {
		void counted;
	}

	return redirectResponse(record.url, record.permanent === true);
}

export const handle: Handle = async ({ event, resolve }) => {
	const config = getConfig(event.platform);

	// Resolve the admin session for every request; /link routes rely on it.
	event.locals.authed = await verifySessionToken(
		event.cookies.get(SESSION_COOKIE),
		config.sessionSecret
	);

	const host = event.request.headers.get('host') ?? '';
	if (!matchesShortHost(host, config.shortHost)) {
		return resolve(event);
	}

	return handleShortHost(event, config);
};
