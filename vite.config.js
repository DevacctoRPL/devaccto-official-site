import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Lets the short-link host be exercised during `bun run dev`, e.g. with
		// `curl -H 'Host: to.devaccto-rpl.web.id' http://localhost:5173/promo`.
		// Dev-only; production hostnames come from the Cloudflare custom domain.
		allowedHosts: ['to.devaccto-rpl.web.id', '.devaccto-rpl.web.id']
	}
});
