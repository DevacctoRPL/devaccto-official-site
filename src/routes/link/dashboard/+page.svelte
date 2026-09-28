<script lang="ts">
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  type Link = PageData['links'][number];
  type Draft = { slug: string; url: string; title: string; expiresAt: string; permanent: boolean };

  const blank = (): Draft => ({ slug: '', url: '', title: '', expiresAt: '', permanent: false });

  let editingSlug = '';
  let draft: Draft = blank();
  let copied = '';
  let feedback = '';

  $: links = data.links;
  $: creating = editingSlug === '';
  $: shortUrl = (slug: string) => `https://${data.shortHost}/${slug}`;

  // Surface action results, and keep the user's input when validation fails.
  $: if (form) {
    if (form.message) feedback = form.message;
    if (form.fields) draft = { ...draft, ...form.fields };
  }

  $: stats = {
    total: links.length,
    active: links.filter((l: Link) => l.active && !l.expired).length,
    clicks: links.reduce((sum: number, l: Link) => sum + (l.clicks ?? 0), 0)
  };

  function startCreate() {
    editingSlug = '';
    draft = blank();
  }

  function startEdit(link: Link) {
    editingSlug = link.slug;
    draft = {
      slug: link.slug,
      url: link.url,
      title: link.title,
      expiresAt: link.expiresAtInput,
      permanent: link.permanent
    };
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = text;
      setTimeout(() => {
        if (copied === text) copied = '';
      }, 1500);
    } catch {
      /* clipboard unavailable; the URL is visible for manual copy */
    }
  }

  function flash(message: string) {
    feedback = message;
    setTimeout(() => {
      if (feedback === message) feedback = '';
    }, 4000);
  }

  /** Narrows the action result payload without putting an object type in markup. */
  function actionMessage(data: unknown, fallback: string): string {
    const message = (data as { message?: unknown } | undefined)?.message;
    return typeof message === 'string' ? message : fallback;
  }
</script>

<svelte:head>
  <title>Link Manager · Devaccto RPL</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
  <header class="border-b border-gray-300 dark:border-white/10 bg-white dark:bg-primary-light/60 backdrop-blur sticky top-0 z-10">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Link Manager</h1>
        <p class="text-xs text-gray-600 dark:text-gray-500 code-font">
          https://{data.shortHost}/<span class="text-secondary">slug</span>
        </p>
      </div>
      <form method="POST" action="/link/logout">
        <button class="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-400 hover:border-secondary hover:text-secondary transition">
          Keluar
        </button>
      </form>
    </div>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-8 space-y-6">
    {#if data.usingDefaultCode || data.usingDefaultSecret}
      <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
        {#if data.usingDefaultCode}
          Kode akses masih memakai default <span class="code-font">12345678</span>. Set variabel
          <span class="code-font">LINK_ADMIN_CODE</span> di Cloudflare agar lebih aman.
        {:else}
          <span class="code-font">SESSION_SECRET</span> belum diset — sesi memakai nilai turunan.
          Sebaiknya set nilai acak di Cloudflare.
        {/if}
      </div>
    {/if}

    {#if !data.persistent}
      <div class="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        Binding KV <span class="code-font">LINKS_KV</span> belum aktif. Link hanya tersimpan di
        memori dan akan hilang saat redeploy. Lihat panduan setup di README.
      </div>
    {/if}

    <section class="grid grid-cols-3 gap-4">
      {#each [['Total', stats.total], ['Aktif', stats.active], ['Klik', stats.clicks]] as [label, value]}
        <div class="rounded-2xl border border-gray-300 dark:border-white/10 bg-white dark:bg-primary-light/40 px-5 py-4">
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">{label}</p>
          <p class="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      {/each}
    </section>

    {#if feedback}
      <p class="text-sm text-secondary bg-secondary/10 border border-secondary/20 rounded-lg px-3 py-2">
        {feedback}
      </p>
    {/if}

    <section class="rounded-2xl border border-gray-300 dark:border-white/10 bg-white dark:bg-primary-light/40 p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">
          {creating ? 'Buat link baru' : `Edit /${editingSlug}`}
        </h2>
        {#if !creating}
          <button type="button" on:click={startCreate} class="text-xs text-secondary hover:underline">
            + Link baru
          </button>
        {/if}
      </div>

      <form
        method="POST"
        action={creating ? '?/create' : '?/update'}
        use:enhance={() => {
          return async ({ result, update }) => {
            if (result.type === 'success') {
              const message = actionMessage(result.data, 'Berhasil disimpan.');
              startCreate();
              flash(message);
              await invalidateAll();
            } else {
              await update();
            }
          };
        }}
        class="grid md:grid-cols-2 gap-4"
      >
        {#if creating}
          <div>
            <label for="slug" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label>
            <input
              id="slug"
              name="slug"
              bind:value={draft.slug}
              required
              placeholder="promo2026"
              class="code-font w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
            />
          </div>
        {:else}
          <div>
            <label for="slug-display" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Slug</label>
            <input type="hidden" name="slug" value={editingSlug} />
            <input
              id="slug-display"
              value={editingSlug}
              disabled
              class="code-font w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60 text-gray-900 dark:text-white disabled:opacity-60 transition"
            />
            <p class="text-xs text-gray-500 mt-1">Slug tidak dapat diubah saat mengedit.</p>
          </div>
        {/if}

        <div>
          <label for="title" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Judul (opsional)</label>
          <input
            id="title"
            name="title"
            bind:value={draft.title}
            placeholder="Link pendaftaran"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
          />
        </div>

        <div class="md:col-span-2">
          <label for="url" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">URL Tujuan</label>
          <input
            id="url"
            name="url"
            bind:value={draft.url}
            required
            placeholder="https://example.com/halaman-panjang"
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
          />
        </div>

        <div>
          <label for="expiresAt" class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kedaluwarsa (opsional)</label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            bind:value={draft.expiresAt}
            class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
          />
        </div>

        <label class="flex items-center gap-2 self-end pb-2 text-sm text-gray-700 dark:text-gray-400">
          <input type="checkbox" name="permanent" bind:checked={draft.permanent} class="accent-secondary w-4 h-4" />
          Gunakan redirect permanen (301)
        </label>

        <div class="md:col-span-2 flex gap-3">
          <button
            type="submit"
            class="px-5 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:opacity-90 transition shadow"
          >
            {creating ? 'Buat link' : 'Simpan perubahan'}
          </button>
          {#if !creating}
            <button
              type="button"
              on:click={startCreate}
              class="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-400 hover:border-secondary hover:text-secondary transition"
            >
              Batal
            </button>
          {/if}
        </div>
      </form>
    </section>

    <section class="rounded-2xl border border-gray-300 dark:border-white/10 bg-white dark:bg-primary-light/40 overflow-hidden">
      {#if links.length === 0}
        <p class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-500">
          Belum ada link. Buat link pertama lewat formulir di atas.
        </p>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 border-b border-gray-300 dark:border-white/10">
              <tr>
                <th class="px-5 py-3 font-medium">Slug</th>
                <th class="px-5 py-3 font-medium">Tujuan</th>
                <th class="px-5 py-3 font-medium">Status</th>
                <th class="px-5 py-3 font-medium text-right">Klik</th>
                <th class="px-5 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each links as link (link.slug)}
                <tr class="border-b border-gray-200 dark:border-white/5 last:border-0 align-top">
                  <td class="px-5 py-4">
                    <button
                      class="code-font text-left text-secondary hover:underline"
                      title="Salin link pendek"
                      on:click={() => copy(shortUrl(link.slug))}
                    >
                      /{link.slug}
                    </button>
                    {#if copied === shortUrl(link.slug)}
                      <span class="block text-xs text-green-500 mt-1">Tersalin!</span>
                    {/if}
                    {#if link.title}
                      <span class="block text-xs text-gray-500 mt-1">{link.title}</span>
                    {/if}
                  </td>
                  <td class="px-5 py-4 max-w-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-gray-700 dark:text-gray-400 hover:text-secondary break-all line-clamp-2"
                      title={link.url}
                    >
                      {link.url}
                    </a>
                    {#if link.expiresAt}
                      <span class="block text-xs text-gray-500 mt-1">
                        s/d {link.expiresAtInput}{link.expired ? ' (kedaluwarsa)' : ''}
                      </span>
                    {/if}
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border {link.active && !link.expired
                        ? 'border-green-500/30 text-green-600 dark:text-green-400 bg-green-500/10'
                        : 'border-gray-400/30 text-gray-500 bg-gray-500/10'}"
                    >
                      {link.active && !link.expired ? 'Aktif' : link.expired ? 'Kedaluwarsa' : 'Nonaktif'}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-right text-gray-700 dark:text-gray-400 tabular-nums">{link.clicks ?? 0}</td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-400 hover:border-secondary hover:text-secondary transition text-xs"
                        on:click={() => startEdit(link)}
                      >
                        Edit
                      </button>

                      <form method="POST" action="?/toggle" use:enhance>
                        <input type="hidden" name="slug" value={link.slug} />
                        <button class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-400 hover:border-secondary hover:text-secondary transition text-xs">
                          {link.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </form>

                      <form method="POST" action="?/resetClicks" use:enhance>
                        <input type="hidden" name="slug" value={link.slug} />
                        <button
                          class="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-400 hover:border-secondary hover:text-secondary transition text-xs"
                          title="Reset statistik klik"
                        >
                          Reset
                        </button>
                      </form>

                      <form
                        method="POST"
                        action="?/delete"
                        use:enhance={({ cancel }) => {
                          if (!confirm(`Hapus link /${link.slug}?`)) {
                            cancel();
                            return;
                          }
                          return async ({ update }) => {
                            flash(`Link /${link.slug} dihapus.`);
                            await update();
                          };
                        }}
                      >
                        <input type="hidden" name="slug" value={link.slug} />
                        <button class="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition text-xs">
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  </main>
</div>
