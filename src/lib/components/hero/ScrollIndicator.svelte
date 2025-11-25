<script lang="ts">
  export let color: string = 'white';
</script>

<div class="flex flex-col items-center">
  <svg class="h-10 w-10 text-white/80" fill="none" stroke={color} viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
  </svg>
  <svg class="h-10 w-10 -mt-6 animate-bounce text-white" fill="none" stroke={color} viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
  </svg>
</div>

<style>
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0); }
    40%, 43% { transform: translate3d(0, -30px, 0); }
    70% { transform: translate3d(0, -15px, 0); }
    90% { transform: translate3d(0, -4px, 0); }
  }
  .animate-bounce { animation: bounce 2s infinite; }
</style>