
# Devaccto RPL - Official Website

The official website of Devaccto RPL, a student organization specializing in Software Engineering. It features an organization profile, project showcase, and activity documentation. Built with SvelteKit and Tailwind, it is open source. Tagline: Develop, Deploy, Deliver.
## Authors

[@SynchronizesTeams](https://github.com/SynchronizesTeams)
[@Fir3fliesss](https://github.com/Fir3fliesss)
[@adeleeeeyyyy](https://github.com/adeleeeeyyyy)
[@JohnObama24](https://github.com/JohnObama24)
[@adityakurnias](https://github.com/adityakurnias) 
## Contributing

### 🤝 Contributing Guide

Contributions are always welcome!  
Please follow the workflow below to ensure a smooth and efficient contribution process.  
For more detailed instructions, please check **`CONTRIBUTING.md`**.

---

### 🚀 Contribution Workflow

#### 1. Fork the Repository
Click the **Fork** button at the top-right corner of this repository to create your own copy.

#### 2. Clone Your Fork
Clone the forked repository into your local machine:

```
git clone https://github.com/<your-username>/devaccto-official-site.git
cd devaccto-official-site
```

#### 3. Make Your Changes
Implement improvements, new features, refactoring, or documentation updates.
Make sure your code is clean, consistent, and follows the project’s standards.

#### 4. Open a Pull Request
## Tech Stack

**Client:** SvelteKit, TailwindCSS

**Server:** So We're finding a Backend Framework to full the code of this repo - [Finding a Catholic Man to Love the Love of My Life, Reality Club]

---

## Link Shortener

The project also powers a small link shortener:

| Piece | URL |
| --- | --- |
| Public short links | `https://to.devaccto-rpl.web.id/{slug}` |
| Management dashboard | `https://devaccto-rpl.web.id/link` |

Requests are routed by `Host` header in [`src/hooks.server.ts`](src/hooks.server.ts):
anything arriving on the short-link host is handled as a redirect and never
reaches the SvelteKit routes, so the main site is untouched.

### How it works

- `to.devaccto-rpl.web.id/{slug}` looks the slug up and answers with a `302`
  (or `301` when the link is marked permanent). Inactive or expired links return
  `410`, unknown slugs return `404`, and the host root redirects to the main site.
- `/link` is gated by a login code and a signed, `HttpOnly` session cookie.
- Links are stored in a Cloudflare KV namespace under `link:{slug}`.

### Local development

```bash
bun install
bun run dev
```

Without a KV binding the app falls back to an in-memory store that resets on
restart — handy for local work, never used in production. To exercise the
short-link host locally:

```bash
curl -H 'Host: to.devaccto-rpl.web.id' http://localhost:5173/promo
```

Copy `.env.example` to `.env` to override the code, secret, or hostnames.

### Cloudflare Pages setup

1. **Add the custom domain.** In the Pages project → *Custom domains*, add
   `to.devaccto-rpl.web.id`. Because it points at the **same** project, the
   `hooks.server.ts` host check can serve it. (Cloudflare creates the DNS record
   automatically.)
2. **Create the KV namespace.** *Workers & Pages → KV* → create e.g.
   `devaccto-links`.
3. **Bind it to the Pages project.** *Pages project → Settings → Functions → KV
   namespace bindings* → add a binding named exactly **`LINKS_KV`**.
   The variable name is what the code looks for; the namespace name is yours.
4. **Set environment variables** (*Settings → Environment variables*, for both
   Production and Preview):

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `LINK_ADMIN_CODE` | recommended | Login code for `/link`. Defaults to `12345678` when unset. |
   | `SESSION_SECRET` | recommended | Random string (`openssl rand -hex 32`) used to sign the session cookie. |
   | `SHORT_LINK_HOST` | optional | Defaults to `to.devaccto-rpl.web.id`. |
   | `MAIN_SITE_URL` | optional | Defaults to `https://devaccto-rpl.web.id`. |

5. **Redeploy.** The dashboard shows a warning banner while the KV binding or the
   code/secret are still using defaults.

> Prefer infrastructure as code? A `wrangler.toml` with `pages_build_output_dir =
> ".svelte-kit/cloudflare"` and a `[[kv_namespaces]]` block works too, as long as
> the `name` matches the Pages project.

### Testing

```bash
bun run check   # svelte-check (expects pre-existing site warnings)
bun run smoke   # boots the dev server and exercises login, CRUD, and redirects
```
