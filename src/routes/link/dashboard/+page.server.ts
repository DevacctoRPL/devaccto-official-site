import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getConfig } from '$lib/server/config';
import { getStoreFor, isPersistentStore } from '$lib/server/store';
import {
	formatExpiry,
	isExpired,
	normalizeSlug,
	normalizeUrl,
	parseExpiry,
	validateSlug,
	type LinkListItem
} from '$lib/linkUtils';
import type { LinkRecord } from '$lib/types';

function toListItem(record: LinkRecord): LinkListItem {
	return {
		...record,
		expiresAtInput: formatExpiry(record.expiresAt),
		expired: isExpired(record)
	};
}

function guard(locals: App.Locals): void {
	if (!locals.authed) throw redirect(303, '/link');
}

export const load: PageServerLoad = async ({ locals, platform }) => {
	guard(locals);

	const config = getConfig(platform);
	const records = await getStoreFor(platform).list();

	return {
		links: records.map(toListItem),
		shortHost: config.shortHost,
		mainUrl: config.mainUrl,
		usingDefaultCode: config.usingDefaultCode,
		usingDefaultSecret: config.usingDefaultSecret,
		persistent: isPersistentStore(platform?.env?.LINKS_KV)
	};
};

/** Reads and validates the shared create/update form payload. */
async function readForm(request: Request, existing: LinkRecord | null) {
	const form = await request.formData();
	const rawSlug = String(form.get('slug') ?? '');
	const rawUrl = String(form.get('url') ?? '');
	const title = String(form.get('title') ?? '').trim();
	const expiryRaw = String(form.get('expiresAt') ?? '').trim();
	const permanent = form.get('permanent') === 'on';

	const slug = normalizeSlug(rawSlug);
	const fields = { slug, url: rawUrl, title, expiresAt: expiryRaw };

	const slugError = validateSlug(slug);
	if (slugError) return { ok: false as const, fields, message: slugError };

	if (existing && existing.slug !== slug) {
		return {
			ok: false as const,
			fields,
			message: 'Slug tidak bisa diubah. Hapus lalu buat ulang bila perlu.'
		};
	}

	const url = normalizeUrl(rawUrl);
	if (!url) {
		return { ok: false as const, fields, message: 'URL tujuan tidak valid.' };
	}

	if (expiryRaw && parseExpiry(expiryRaw) === null) {
		return { ok: false as const, fields, message: 'Tanggal kedaluwarsa tidak valid.' };
	}

	const now = Date.now();
	const record: LinkRecord = {
		slug,
		url,
		title,
		permanent,
		// Active state is managed by the dedicated toggle action.
		active: existing?.active ?? true,
		clicks: existing?.clicks ?? 0,
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
		expiresAt: parseExpiry(expiryRaw)
	};

	return { ok: true as const, record };
}

async function findExisting(slugInput: unknown, store: ReturnType<typeof getStoreFor>) {
	const slug = normalizeSlug(String(slugInput ?? ''));
	const existing = slug ? await store.get(slug) : null;
	return { slug, existing };
}

export const actions: Actions = {
	create: async ({ request, locals, platform }) => {
		guard(locals);

		const store = getStoreFor(platform);
		const parsed = await readForm(request, null);
		if (!parsed.ok) return fail(400, { message: parsed.message, fields: parsed.fields });

		if (await store.get(parsed.record.slug)) {
			return fail(409, {
				message: `Slug "${parsed.record.slug}" sudah dipakai.`,
				fields: parsed.fields
			});
		}

		await store.save(parsed.record);
		return { success: true, message: `Link /${parsed.record.slug} berhasil dibuat.` };
	},

	update: async ({ request, locals, platform }) => {
		guard(locals);

		const store = getStoreFor(platform);
		const body = await request.clone().formData();
		const { existing } = await findExisting(body.get('slug'), store);

		if (!existing) return fail(404, { message: 'Link tidak ditemukan.' });

		const parsed = await readForm(request, existing);
		if (!parsed.ok) return fail(400, { message: parsed.message, fields: parsed.fields });

		await store.save(parsed.record);
		return { success: true, message: `Link /${parsed.record.slug} berhasil diperbarui.` };
	},

	toggle: async ({ request, locals, platform }) => {
		guard(locals);

		const store = getStoreFor(platform);
		const form = await request.formData();
		const { slug, existing } = await findExisting(form.get('slug'), store);

		if (!existing) return fail(404, { message: 'Link tidak ditemukan.' });

		const active = !existing.active;
		await store.save({ ...existing, active, updatedAt: Date.now() });
		return { success: true, message: `Link /${slug} ${active ? 'diaktifkan' : 'dinonaktifkan'}.` };
	},

	resetClicks: async ({ request, locals, platform }) => {
		guard(locals);

		const store = getStoreFor(platform);
		const { slug, existing } = await findExisting((await request.formData()).get('slug'), store);

		if (!existing) return fail(404, { message: 'Link tidak ditemukan.' });

		await store.save({ ...existing, clicks: 0, updatedAt: Date.now() });
		return { success: true, message: `Statistik /${slug} direset.` };
	},

	delete: async ({ request, locals, platform }) => {
		guard(locals);

		const store = getStoreFor(platform);
		const { slug, existing } = await findExisting((await request.formData()).get('slug'), store);

		if (!existing) return fail(404, { message: 'Link tidak ditemukan.' });

		await store.remove(slug);
		return { success: true, message: `Link /${slug} dihapus.` };
	}
};
