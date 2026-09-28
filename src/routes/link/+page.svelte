<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;

  let submitting = false;

  $: message = form?.message;
</script>

<svelte:head>
  <title>Masuk · Link Manager</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="min-h-screen flex items-center justify-center px-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 shadow-lg mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Link Manager</h1>
      <p class="text-sm text-gray-600 dark:text-gray-500 mt-1">Masukkan kode akses untuk melanjutkan.</p>
    </div>

    <form
      method="POST"
      use:enhance={() => {
        submitting = true;
        return async ({ update }) => {
          await update();
          submitting = false;
        };
      }}
      class="bg-white dark:bg-primary-light border border-gray-300 dark:border-white/10 rounded-2xl shadow-xl p-6 space-y-4"
    >
      <div>
        <label for="code" class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
          Kode Akses
        </label>
        <input
          id="code"
          name="code"
          type="password"
          inputmode="numeric"
          autocomplete="current-password"
          placeholder="••••••••"
          required
          class="code-font w-full tracking-[0.4em] text-center text-lg px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100 dark:bg-gray-900/60 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition"
        />
      </div>

      {#if message}
        <p class="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {message}
        </p>
      {/if}

      <button
        type="submit"
        disabled={submitting}
        class="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-lg"
      >
        {submitting ? 'Memproses…' : 'Masuk'}
      </button>
    </form>

    <p class="text-center text-xs text-gray-500 dark:text-gray-600 mt-6">
      <a href="/" class="hover:text-secondary transition">← Kembali ke situs</a>
    </p>
  </div>
</div>
