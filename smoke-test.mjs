/**
 * End-to-end smoke test for the link shortener.
 *
 * Boots the Vite dev server and exercises the login gate, CRUD form actions,
 * and the short-host redirect path. Run with:
 *
 *   bun smoke-test.mjs
 *
 * It talks to the app the same way the browser does: `Accept: text/html` for
 * plain form posts, and `Accept: application/json` for the `use:enhance`
 * (fetch) submissions that the dashboard UI makes.
 */
import { spawn } from 'node:child_process';

// Loopback traffic must bypass any outbound HTTP proxy.
for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'ALL_PROXY', 'all_proxy']) {
	delete process.env[key];
}
process.env.NO_PROXY = '127.0.0.1,localhost';
process.env.no_proxy = '127.0.0.1,localhost';

const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}`;
const SHORT_HOST = 'to.devaccto-rpl.web.id';
const CODE = process.env.LINK_ADMIN_CODE || '12345678';

const child = spawn('bun', ['run', 'dev', '--', '--port', String(PORT), '--host', '127.0.0.1'], {
	cwd: process.cwd(),
	stdio: ['ignore', 'pipe', 'pipe'],
	env: { ...process.env }
});

let serverLog = '';
child.stdout.on('data', (d) => (serverLog += d));
child.stderr.on('data', (d) => (serverLog += d));

const results = [];
function check(name, ok, detail = '') {
	results.push({ name, ok });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function waitForServer() {
	for (let i = 0; i < 60; i++) {
		try {
			const res = await fetch(`${BASE}/`);
			if (res.status < 500) return true;
		} catch {
			/* not up yet */
		}
		await new Promise((r) => setTimeout(r, 500));
	}
	return false;
}

const encode = (obj) => new URLSearchParams(obj).toString();

/** Plain browser form post: real HTTP status, headers, and HTML body. */
function postForm(path, body, headers = {}) {
	return fetch(`${BASE}${path}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			accept: 'text/html',
			origin: BASE,
			...headers
		},
		body: encode(body),
		redirect: 'manual'
	});
}

/** Mirrors what `use:enhance` sends: JSON action result, HTTP status 200. */
async function postAction(path, body, cookie) {
	const res = await fetch(`${BASE}${path}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/x-www-form-urlencoded',
			accept: 'application/json',
			origin: BASE,
			...(cookie ? { cookie } : {})
		},
		body: encode(body),
		redirect: 'manual'
	});
	const json = await res.json().catch(() => null);
	return { status: res.status, json };
}

const visitShort = (path) =>
	fetch(`${BASE}${path}`, {
		headers: { host: SHORT_HOST, accept: 'text/html' },
		redirect: 'manual'
	});

try {
	check('dev server boots', await waitForServer());

	// --- Authentication gate ---------------------------------------------
	const loginHtml = await (await fetch(`${BASE}/link`)).text();
	check('GET /link renders the login page', loginHtml.includes('Kode Akses'));

	const gated = await fetch(`${BASE}/link/dashboard`, { redirect: 'manual' });
	check('dashboard redirects when logged out', gated.status === 303, `status=${gated.status}`);

	const wrong = await postForm('/link', { code: '00000000' });
	check('wrong code rejected', wrong.status === 401, `status=${wrong.status}`);

	const login = await postForm('/link', { code: CODE });
	const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
	check(
		'correct code starts a session',
		login.status === 303 && cookie.startsWith('devaccto_link_session='),
		`status=${login.status}`
	);

	const dash = await fetch(`${BASE}/link/dashboard`, { headers: { cookie } });
	check('dashboard renders when authed', dash.status === 200);

	// --- Create ----------------------------------------------------------
	const created = await postAction('/link/dashboard?/create', {
		slug: 'promo',
		url: 'example.com/very/long/path',
		title: 'Promo',
		expiresAt: ''
	}, cookie);
	check('create succeeds', created.json?.type === 'success', JSON.stringify(created.json?.type));

	const duplicate = await postAction('/link/dashboard?/create', {
		slug: 'promo',
		url: 'https://example.org',
		title: ''
	}, cookie);
	check(
		'duplicate slug rejected',
		duplicate.json?.type === 'failure' && duplicate.json?.status === 409,
		`status=${duplicate.json?.status}`
	);

	const badUrl = await postAction('/link/dashboard?/create', {
		slug: 'bad',
		url: 'not a url at all',
		title: ''
	}, cookie);
	check(
		'invalid url rejected',
		badUrl.json?.type === 'failure' && badUrl.json?.status === 400,
		`status=${badUrl.json?.status}`
	);

	const reserved = await postAction('/link/dashboard?/create', {
		slug: 'link',
		url: 'https://example.org',
		title: ''
	}, cookie);
	check(
		'reserved slug rejected',
		reserved.json?.type === 'failure' && reserved.json?.status === 400,
		`status=${reserved.json?.status}`
	);

	// --- Redirect path ---------------------------------------------------
	const go = await visitShort('/promo');
	check(
		'target url is redirected to',
		go.status === 302 && (go.headers.get('location') ?? '').includes('example.com/very/long/path'),
		`status=${go.status} location=${go.headers.get('location')}`
	);

	const missing = await visitShort('/does-not-exist');
	check('unknown slug returns 404', missing.status === 404, `status=${missing.status}`);

	const root = await visitShort('/');
	check(
		'short-host root redirects to main site',
		root.status === 302 && (root.headers.get('location') ?? '').includes('devaccto-rpl.web.id'),
		`status=${root.status} location=${root.headers.get('location')}`
	);

	const robots = await visitShort('/robots.txt');
	check(
		'short-host robots.txt blocks indexing',
		robots.status === 200 && (await robots.text()).includes('Disallow: /')
	);

	const blocked = await visitShort('/link');
	check('reserved slug is not redirected', blocked.status === 404, `status=${blocked.status}`);

	check('main site still renders', (await fetch(`${BASE}/`)).status === 200);

	// --- Update / toggle / delete ----------------------------------------
	const toggledOff = await postAction('/link/dashboard?/toggle', { slug: 'promo' }, cookie);
	check('toggle succeeds', toggledOff.json?.type === 'success');
	const off = await visitShort('/promo');
	check('toggled-off link returns 410', off.status === 410, `status=${off.status}`);

	const updated = await postAction('/link/dashboard?/update', {
		slug: 'promo',
		url: 'https://example.net/new',
		title: 'Baru',
		expiresAt: ''
	}, cookie);
	check('update succeeds', updated.json?.type === 'success');

	await postAction('/link/dashboard?/toggle', { slug: 'promo' }, cookie);
	const renamed = await visitShort('/promo');
	check(
		'updated target is served',
		renamed.status === 302 && (renamed.headers.get('location') ?? '').includes('example.net/new'),
		`location=${renamed.headers.get('location')}`
	);

	const reset = await postAction('/link/dashboard?/resetClicks', { slug: 'promo' }, cookie);
	check('reset clicks succeeds', reset.json?.type === 'success');

	const deleted = await postAction('/link/dashboard?/delete', { slug: 'promo' }, cookie);
	check('delete succeeds', deleted.json?.type === 'success');
	const gone = await visitShort('/promo');
	check('deleted link returns 404', gone.status === 404, `status=${gone.status}`);

	// --- Authorisation on the API surface --------------------------------
	const anon = await postAction('/link/dashboard?/delete', { slug: 'promo' });
	check(
		'anon CRUD is redirected to login',
		anon.json?.type === 'redirect' && anon.json?.location === '/link',
		JSON.stringify(anon.json)
	);

	// --- Logout -----------------------------------------------------------
	const logout = await postForm('/link/logout', {}, { cookie });
	const cleared = logout.headers.get('set-cookie') ?? '';
	check(
		'logout clears the session cookie',
		logout.status === 303 && /devaccto_link_session=;/.test(cleared),
		`status=${logout.status}`
	);
} catch (error) {
	console.error('Smoke test crashed:', error);
	check('smoke test completed without crashing', false, String(error));
} finally {
	child.kill('SIGTERM');
	await new Promise((r) => setTimeout(r, 500));
	const failed = results.filter((r) => !r.ok);
	console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
	if (failed.length && serverLog) {
		console.log('\n--- server log tail ---');
		console.log(serverLog.split('\n').slice(-25).join('\n'));
	}
	process.exit(failed.length ? 1 : 0);
}
