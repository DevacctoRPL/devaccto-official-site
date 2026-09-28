<script lang="ts">
  // Importing the store initialises the `dark` class on <html> from localStorage
  // or the system preference, so the admin pages follow the site theme.
  import '$lib/stores/themeStore';
</script>

<slot />
