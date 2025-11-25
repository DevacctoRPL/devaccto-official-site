<script lang="ts">
    import EmbedIcon from "../icons/EmbedIcon.svelte";
    import MoonIcon from "../icons/MoonIcon.svelte";
    import SunIcon from "../icons/SunIcon.svelte";
    import { isDarkMode, toggleTheme } from "$lib/stores/themeStore";

    const menuItems = [
        { label: "Home", href: "#" },
        { label: "Division", href: "#division" },
        { label: "Project", href: "#project" },
        { label: "Events", href: "#events" },
    ];
</script>

<header class="absolute top-0 left-0 w-full z-20 py-4">
    <nav class="container mx-auto px-8">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="text-white animate-pulse">
                    <EmbedIcon />
                </div>
                <button
                    class="relative h-8 w-16 rounded-full {$isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-gray-600 to-gray-700'} shadow-lg flex items-center justify-center overflow-hidden transition-all duration-500 ease-in-out group hover:scale-105"
                    aria-label="toggle theme"
                    on:click={toggleTheme}
                >
                    <!-- Glow effect -->
                    <div class="absolute inset-0 {$isDarkMode ? 'bg-indigo-500/20' : 'bg-yellow-400/30'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                    
                    <!-- Track decoration -->
                    <div class="absolute inset-2 rounded-full {$isDarkMode ? 'bg-gray-900/50' : 'bg-gray-800/30'}"></div>
                    
                    <!-- Sliding indicator -->
                    <div
                        class="absolute left-1 top-1 h-6 w-6 rounded-full {$isDarkMode ? 'bg-gradient-to-br from-gray-100 to-white' : 'bg-gradient-to-br from-yellow-200 to-yellow-100'} shadow-md transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] flex items-center justify-center group-hover:shadow-xl"
                        style="transform: translateX({$isDarkMode
                            ? '32px'
                            : '0px'});"
                    >
                        <div class="{$isDarkMode ? 'text-indigo-600' : 'text-orange-500'} transition-colors duration-300">
                            {#if $isDarkMode}
                                <MoonIcon />
                            {:else}
                                <SunIcon />
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Particles animation -->
                    {#if $isDarkMode}
                        <div class="absolute left-8 top-1 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                        <div class="absolute right-8 top-3 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping animation-delay-200"></div>
                        <div class="absolute left-7 bottom-2 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-ping animation-delay-400"></div>
                    {:else}
                        <div class="absolute right-8 top-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                        <div class="absolute left-8 top-3 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping animation-delay-200"></div>
                        <div class="absolute right-7 bottom-2 w-0.5 h-0.5 bg-red-300 rounded-full animate-ping animation-delay-400"></div>
                    {/if}
                </button>
            </div>

            <div class="flex items-center gap-32 justify-between">
                {#each menuItems as item}
                    <a
                        href={item.href}
                        class="text-lg font-medium"
                        style="
                            text-shadow: 0px 1px 0px rgba(0,0,0,0.20);
                            color: {item.label === 'Home' ? '#000000' : '#D1D1D1'};
                            mix-blend-mode: difference;
                        "
                    >
                        {item.label}
                    </a>
                {/each}
            </div>
        </div>
    </nav>
</header>

<style>
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 1;
        }
        50% {
            transform: translateY(-5px) scale(1.05);
            opacity: 0.9;
        }
    }
    
    .animate-float {
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes sparkle {
        0%, 100% {
            opacity: 0;
            transform: scale(0.5);
        }
        50% {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    .animation-delay-200 {
        animation-delay: 200ms;
    }
    
    .animation-delay-400 {
        animation-delay: 400ms;
    }
    
    /* Theme switch rotation */
    .theme-switch-active {
        animation: themeRotate 0.6s ease-in-out;
    }
    
    @keyframes themeRotate {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.1); }
        100% { transform: rotate(360deg) scale(1); }
    }
    
    /* Glow pulse effect */
    @keyframes glowPulse {
        0%, 100% {
            filter: brightness(1) drop-shadow(0 0 8px currentColor);
        }
        50% {
            filter: brightness(1.2) drop-shadow(0 0 12px currentColor);
        }
    }
    
    .glow-pulse {
        animation: glowPulse 2s ease-in-out infinite;
    }
</style>
