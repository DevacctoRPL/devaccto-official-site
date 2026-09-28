import { env as privateEnv } from '$env/dynamic/private';

/** Fallback login code, used when LINK_ADMIN_CODE is not configured. */
export const DEFAULT_ADMIN_CODE = '12345678';

/** Hostname that serves the short links, e.g. to.devaccto-rpl.web.id */
export const DEFAULT_SHORT_HOST = 'to.devaccto-rpl.web.id';

/** Where requests to the root of the short-link host are sent. */
export const DEFAULT_MAIN_URL = 'https://devaccto-rpl.web.id';

export interface AppConfig {
	/** Hostname that serves short links. */
	shortHost: string;
	/** Absolute URL of the main site (no trailing slash). */
	mainUrl: string;
	/** Login code for /link. */
	adminCode: string;
	/** Secret used to sign the admin session cookie. */
	sessionSecret: string;
	/** True when the code/secret come from the built-in defaults. */
	usingDefaultCode: boolean;
	usingDefaultSecret: boolean;
}

/**
 * Resolves runtime configuration.
 *
 * Cloudflare Workers expose bindings and variables through `platform.env`,
 * while `vite dev` exposes `.env` files through `$env/dynamic/private`.
 * `platform.env` always wins so production stays authoritative.
 */
export function getConfig(platform?: App.Platform | null): AppConfig {
	const env = platform?.env ?? {};

	const shortHost = (env.SHORT_LINK_HOST ?? privateEnv.SHORT_LINK_HOST ?? '').trim();
	const mainUrl = (env.MAIN_SITE_URL ?? privateEnv.MAIN_SITE_URL ?? '').trim();
	const adminCode = (env.LINK_ADMIN_CODE ?? privateEnv.LINK_ADMIN_CODE ?? '').trim();
	const sessionSecret = (env.SESSION_SECRET ?? privateEnv.SESSION_SECRET ?? '').trim();

	const resolvedCode = adminCode || DEFAULT_ADMIN_CODE;

	return {
		shortHost: shortHost || DEFAULT_SHORT_HOST,
		mainUrl: (mainUrl || DEFAULT_MAIN_URL).replace(/\/+$/, ''),
		adminCode: resolvedCode,
		// Falling back to a value derived from the code keeps local dev working.
		// Set SESSION_SECRET in production so rotating the code also rotates sessions.
		sessionSecret: sessionSecret || `devaccto-link-session::${resolvedCode}`,
		usingDefaultCode: !adminCode,
		usingDefaultSecret: !sessionSecret
	};
}

/** Compares a request Host header against the configured short-link host. */
export function matchesShortHost(requestHost: string, configuredHost: string): boolean {
	const host = requestHost.toLowerCase();
	const configured = configuredHost.toLowerCase();

	if (host === configured) return true;

	// In `vite dev` the Host header carries a port; ignore it on the request
	// side unless the configured host explicitly asks for a port.
	if (!configured.includes(':') && host.split(':')[0] === configured) return true;

	return false;
}
