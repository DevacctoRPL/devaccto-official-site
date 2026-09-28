import { dev } from '$app/environment';

export const SESSION_COOKIE = 'devaccto_link_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sign(payload: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

export function verifyCode(input: string, expected: string): boolean {
	return timingSafeEqual(input.trim(), expected);
}

/** Token format: `<expiryEpochMs>.<hmac>` */
export async function createSessionToken(secret: string, now = Date.now()): Promise<string> {
	const expiresAt = now + SESSION_MAX_AGE * 1000;
	return `${expiresAt}.${await sign(String(expiresAt), secret)}`;
}

export async function verifySessionToken(
	token: string | undefined | null,
	secret: string,
	now = Date.now()
): Promise<boolean> {
	if (!token) return false;

	const separator = token.indexOf('.');
	if (separator < 1) return false;

	const expiresAtRaw = token.slice(0, separator);
	const signature = token.slice(separator + 1);

	const expiresAt = Number(expiresAtRaw);
	if (!Number.isFinite(expiresAt) || expiresAt <= now) return false;

	return timingSafeEqual(signature, await sign(expiresAtRaw, secret));
}

export function sessionCookieOptions() {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: !dev,
		maxAge: SESSION_MAX_AGE
	};
}
