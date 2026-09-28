<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { onMount } from 'svelte';
  import { isDarkMode } from '$lib/stores/themeStore';
</script>

<div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
  <Header />
  
  <main class="flex-grow">
    <slot />
  </main>
  
  <Footer />
</div>
