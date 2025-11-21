<script lang="ts">
    import { onMount } from "svelte";
    
    let copied = false;

    let codeLines = [
        { indent: 0, text: "// Devaccto RPL - Development Acceleration Troops", type: "comment" },
        { indent: 0, text: "", type: "empty" },
        { indent: 0, text: "interface DevacctoRPL {", type: "interface" },
        { indent: 1, text: "divisions: string[];", type: "property" },
        { indent: 1, text: "getDivisionCount(): number;", type: "method" },
        { indent: 1, text: "getSpecialties(): string[];", type: "method" },
        { indent: 0, text: "}", type: "bracket" },
        { indent: 0, text: "", type: "empty" },
        { indent: 0, text: "class Devaccto implements DevacctoRPL {", type: "class" },
        { indent: 1, text: 'divisions = ["WebDev", "GameDev", "MobileDev", "AI/ML", "CySec"];', type: "property" },
        { indent: 0, text: "", type: "empty" },
        { indent: 1, text: "getDivisionCount(): number {", type: "method" },
        { indent: 2, text: "return this.divisions.length;", type: "return" },
        { indent: 1, text: "}", type: "bracket" },
        { indent: 0, text: "", type: "empty" },
        { indent: 1, text: "getSpecialties(): string[] {", type: "method" },
        { indent: 2, text: "return [", type: "return" },
        { indent: 3, text: '"Website Development",', type: "string" },
        { indent: 3, text: '"Game Development",', type: "string" },
        { indent: 3, text: '"Mobile Applications",', type: "string" },
        { indent: 3, text: '"Machine Learning",', type: "string" },
        { indent: 3, text: '"Cyber Security",', type: "string" },
        { indent: 2, text: "];", type: "bracket" },
        { indent: 1, text: "}", type: "bracket" },
        { indent: 0, text: "}", type: "bracket" },
    ];

    let visibleLines: boolean[] = new Array(codeLines.length).fill(false);
    let mouseX = 0;
    let mouseY = 0;
    
    function generateCodeText() {
        return codeLines.map(line => {
            const indent = "  ".repeat(line.indent);
            return indent + line.text;
        }).join("\n");
    }
    
    async function copyCode() {
        try {
            const codeText = generateCodeText();
            await navigator.clipboard.writeText(codeText);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    }

    onMount(() => {
        // Animate code lines appearing
        codeLines.forEach((_, i) => {
            setTimeout(() => {
                visibleLines[i] = true;
            }, i * 100);
        });

        // Track mouse for parallax
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    });
</script>

<div class="relative min-h-screen bg-black overflow-hidden">
    <!-- Grid Background -->
    <div class="absolute inset-0 bg-grid"></div>

    <!-- Floating Background Shapes -->
    <div class="absolute inset-0">
        {#each Array(5) as _, i}
            <div
                class="absolute morph-shape bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl"
                style="
          width: {200 + i * 50}px;
          height: {200 + i * 50}px;
          top: {20 + i * 15}%;
          left: {10 + i * 18}%;
          animation-delay: {i * 1.5}s;
          transform: translate({mouseX * (10 + i * 2)}px, {mouseY *
                    (10 + i * 2)}px);
        "
            ></div>
        {/each}
    </div>

    <!-- Main Content -->
    <div
        class="relative z-10 flex flex-col items-center justify-center min-h-screen p-8"
    >
        <!-- Title -->
        <h1 class="text-6xl md:text-8xl font-bold mb-4">
            <span class="gradient-text">Devaccto RPL</span>
        </h1>

        <!-- Subtitle -->
        <p class="text-xl md:text-2xl text-gray-400 mb-2 code-font">
            <span class="text-purple-400">class</span> UnderConstruction
            <span class="text-pink-400">implements</span> ComingSoon
        </p>

        <!-- Status Message -->
        <div
            class="mt-8 px-6 py-3 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10"
        >
            <p class="text-gray-300 text-center">
                <span class="text-green-400 code-font">Status:</span>
                <span class="text-yellow-400"
                    >Transforming ideas into reality...</span
                >
            </p>
        </div>

        <!-- Code Animation -->
        <div class="mt-12 max-w-4xl w-full px-4">
            <div
                class="bg-gray-900/90 backdrop-blur-lg rounded-lg border border-purple-500/20 shadow-lg shadow-purple-500/10"
            >
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors cursor-pointer"></div>
                        <div class="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors cursor-pointer"></div>
                        <div class="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors cursor-pointer"></div>
                    </div>
                    <span class="text-gray-400 text-sm code-font">DevacctoRPL.ts</span>
                    <div class="flex items-center gap-3">
                        <button
                            on:click={copyCode}
                            class="relative group/copy px-3 py-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 rounded-md transition-all duration-200 border border-purple-500/30 hover:border-purple-500/50"
                            title={copied ? "Copied to clipboard!" : "Copy code"}
                        >
                            {#if copied}
                                <span class="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </span>
                            {:else}
                                <span class="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Copy
                                </span>
                            {/if}
                        </button>
                        <div class="text-xs text-gray-500 code-font">TypeScript</div>
                    </div>
                </div>
                <div class="relative p-4 md:p-6 max-h-96 overflow-auto code-container"
                     role="region"
                     aria-label="Code editor"
                     tabindex="0"
                     on:keydown={(e) => {
                         if ((e.ctrlKey || e.metaKey) && e.key === 'c' && window.getSelection()?.toString() === '') {
                             copyCode();
                         }
                     }}>
                    <div class="text-xs md:text-sm code-font min-w-max">
{#each codeLines as line, i}
                        <div class="flex group hover:bg-gray-800/30 rounded transition-all duration-300 {visibleLines[i] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}">
                            <span class="text-gray-600 text-xs w-8 text-right pr-4 select-none group-hover:text-gray-500 transition-colors">{i + 1}</span>
                            <div class="flex-1" style="padding-left: {line.indent * 24}px">
                            {#if line.type === 'comment'}
                                <span class="text-gray-500 italic">{line.text}</span>
                            {:else if line.type === 'interface'}
                                <span class="text-purple-400">interface</span> <span class="text-purple-300">DevacctoRPL</span> <span class="text-gray-400">{'{'}</span>
                            {:else if line.type === 'class'}
                                <span class="text-blue-400">class</span> <span class="text-blue-300">Devaccto</span> <span class="text-pink-400">implements</span> <span class="text-purple-300">DevacctoRPL</span> <span class="text-gray-400">{'{'}</span>
                            {:else if line.type === 'property' && line.text.includes('divisions')}
                                <span class="text-cyan-400">divisions</span> <span class="text-gray-400">=</span> <span class="text-yellow-400">{line.text.substring(line.text.indexOf('['))}</span>
                            {:else if line.type === 'property'}
                                <span class="text-cyan-400">{line.text.split(':')[0]}</span><span class="text-gray-400">:</span> <span class="text-green-400">{line.text.split(':')[1]}</span>
                            {:else if line.type === 'method'}
                                <span class="text-yellow-300">{line.text.split('(')[0]}</span><span class="text-gray-400">({line.text.substring(line.text.indexOf('(') + 1)}</span>
                            {:else if line.type === 'return'}
                                <span class="text-pink-400">return</span> <span class="text-gray-300">{line.text.substring(6)}</span>
                            {:else if line.type === 'string'}
                                <span class="text-green-400">{line.text}</span>
                            {:else if line.type === 'bracket'}
                                <span class="text-gray-400">{line.text}</span>
                            {:else if line.type === 'empty'}
                                <span>&nbsp;</span>
                            {:else}
                                <span class="text-gray-400">{line.text}</span>
                            {/if}
                            </div>
                        </div>
                    {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Loading Dots -->
        <div class="mt-12 flex gap-2">
            {#each Array(3) as _, i}
                <div
                    class="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-bounce"
                    style="animation-delay: {i * 0.2}s"
                ></div>
            {/each}
        </div>
    </div>
</div>

<style>
    .bg-grid {
        background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.03) 1px,
                transparent 1px
            );
        background-size: 50px 50px;
    }
    
    /* Custom scrollbar for code container */
    :global(.code-container::-webkit-scrollbar) {
        width: 8px;
        height: 8px;
    }
    
    :global(.code-container::-webkit-scrollbar-track) {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 4px;
    }
    
    :global(.code-container::-webkit-scrollbar-thumb) {
        background: rgba(139, 92, 246, 0.5);
        border-radius: 4px;
    }
    
    :global(.code-container::-webkit-scrollbar-thumb:hover) {
        background: rgba(139, 92, 246, 0.7);
    }
    
    :global(.code-container:focus) {
        outline: 2px solid rgba(139, 92, 246, 0.3);
        outline-offset: -2px;
        border-radius: 0.5rem;
    }
    
    :global(.code-container:focus-visible) {
        outline: 2px solid rgba(139, 92, 246, 0.5);
    }
</style>
