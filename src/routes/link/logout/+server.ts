import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SESSION_COOKIE, sessionCookieOptions } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete(SESSION_COOKIE, { ...sessionCookieOptions(), maxAge: 0 });
	throw redirect(303, '/link');
};

export const GET: RequestHandler = async () => {
	// Logging out must be an explicit POST; send GETs back to the login page.
	throw redirect(303, '/link');
};
