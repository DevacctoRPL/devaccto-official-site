<script lang="ts">
  import { fly } from 'svelte/transition';
  import HeroBackgroundSplit from './hero/HeroBackgroundSplit.svelte';
  import HeroLogo from './hero/HeroLogo.svelte';
  import HeroText from './hero/HeroText.svelte';
  import ScrollIndicator from './hero/ScrollIndicator.svelte';

  let mouseX = 0;
  let mouseY = 0;
  $: parallaxOffset = { x: mouseX * 0.02, y: mouseY * 0.02 };
  function handleMouseMove(e: MouseEvent) { mouseX = e.clientX; mouseY = e.clientY; }
</script>

<svelte:window on:mousemove={handleMouseMove} />

<section class="relative h-screen w-full overflow-hidden bg-[#eeeeee]">
  <HeroBackgroundSplit rightWidth="65%" rightColor="#7a7a7a" skewDeg={-8} translateX="15%" />

  <div class="relative z-5 h-full">
    <div class="container mx-auto h-full px-10 pr-0 lg:px-12 lg:pr-0 flex items-center">
      <div class="flex w-full items-center justify-between">
        <div class="w-[40%] relative z-5" transition:fly={{ x: -50, duration: 600 }}>
          <!-- <HeroLogo /> -->
        </div>
        <div class="w-[60%] pl-5 pr-0 lg:pl-15 lg:pr-0" transition:fly={{ x: 50, duration: 600, delay: 150 }}>
          <HeroText titleLeft="DEVACCTO" titleRight="IT RPL" tagline="Development Acceleration Troops" />
        </div>
      </div>
    </div>
  </div>

  <div class="absolute bottom-12 left-1/2 -translate-x-1/2 z-10" transition:fly={{ y: 40, duration: 700, delay: 250 }}>
    <ScrollIndicator />
  </div>

  
</section>
