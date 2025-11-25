<script lang="ts">
    export let rightWidth: string = "40%";
    export let skewDeg: number = -8;
    export let lineSkewDeg: number = -20;
    export let overlapAmount: string = "60px";
    import HeroLogo from "$lib/components/hero/HeroLogo.svelte";
    import { isDarkMode } from "$lib/stores/themeStore";

    $: rightColor = $isDarkMode ? "#262B43" : "#7a7a7a";
</script>

<!-- Layer 1 -->
<div
    class="absolute inset-0 bg-light-text dark:bg-dark-text-tertiary pointer-events-none flex items-center justify-center mr-[34rem]"
>
    <HeroLogo />
</div>

<!-- Diagonal Line -->
<div
    class="absolute top-0 h-full backdrop-blur-sm pointer-events-auto z-20"
    style="
    left: 50%;
    width: 20px;
    background: linear-gradient(90deg,
      rgba(255,255,255,0.02) 0%,
      rgba(255,255,255,0.06) 20%,
      rgba(255,255,255,0.04) 40%,
      rgba(255,255,255,0.02) 60%,
      rgba(255,255,255,0.01) 100%
    );
    transform: skewX({lineSkewDeg}deg);
    transform-origin: top right;
    border-left: 1px solid rgba(255,255,255,0.1);
    border-right: 1px solid rgba(255,255,255,0.05);
  "
>
    <div
        class="absolute inset-0"
        style="
      background: linear-gradient(90deg,
        transparent 0%,
        rgba(255,255,255,0.05) 50%,
        transparent 100%
      );
      animation: shimmer 3s ease-in-out infinite;
    "
    ></div>
</div>

<!-- Layer 2 -->
<div
    class="absolute right-0 top-0 h-full pointer-events-none"
    style="
    width: 69%;
    background: {rightColor};
    clip-path: polygon(30% 0, 100% 0, 100% 100%, 0 100%);
    transform-origin: top right;
    overflow: hidden;
  "
>
    <div
        class="absolute inset-0"
        style="
    background: {rightColor};
    transform: skewX({lineSkewDeg * -1}deg);
    transform-origin: top right;
  "
    ></div>
</div>

<style>
    @keyframes shimmer {
        0%,
        100% {
            opacity: 0.3;
        }
        50% {
            opacity: 0.6;
        }
    }
</style>
