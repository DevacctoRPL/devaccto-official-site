import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getConfig } from '$lib/server/config';
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE, verifyCode } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	// Already signed in: skip the login screen.
	if (locals.authed) throw redirect(303, '/link/dashboard');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, locals, platform }) => {
		if (locals.authed) throw redirect(303, '/link/dashboard');

		const config = getConfig(platform);
		const form = await request.formData();
		const code = String(form.get('code') ?? '');

		if (!code.trim()) {
			return fail(400, { message: 'Kode akses wajib diisi.' });
		}

		if (!verifyCode(code, config.adminCode)) {
			// Small delay to make brute-forcing the 8-digit code less attractive.
			await new Promise((resolve) => setTimeout(resolve, 400));
			return fail(401, { message: 'Kode akses salah.' });
		}

		const token = await createSessionToken(config.sessionSecret);
		cookies.set(SESSION_COOKIE, token, sessionCookieOptions());

		throw redirect(303, '/link/dashboard');
	}
};
