<script lang="ts">
  import logoRpl from '$lib/assets/logo-rpl.png';

  export let src: string = logoRpl;
  export let alt: string = 'Divisi RPL';
  export let widthClass: string = 'w-[450px]';
</script>

<div class="flex items-center justify-center">
  <img
    src={src}
    alt={alt}
    class={`h-auto ${widthClass} object-contain`}
    loading="lazy"
    style="filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));"
  />
</div>