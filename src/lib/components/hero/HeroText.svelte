<script lang="ts">
    export let titleLeft: string = "DEVACCTO";
    export let titleRight: string = "IT RPL";
    export let tagline: string = "Development Acceleration Troops";
</script>

<div class="space-y-0">
    <div>
        <h1
            class="font-sans font-black leading-[0.95] tracking-tight text-white"
            style="transform: translateX(-26px);"
        >
            <span
                class="block text-[130px]"
                style="text-shadow: 6px 8px 0 rgba(0,0,0,0.25);"
                >{titleLeft}</span
            >
        </h1>
        <h1
            class="font-sans font-black leading-[0.95] tracking-tight text-white flex items-center"
            style="transform: translateX(400px);"
        >
            <span
                class="text-[130px] whitespace-nowrap"
                style="text-shadow: 6px 8px 0 rgba(0,0,0,0.25);"
                >{titleRight}</span
            >
        </h1>
    </div>
    <div>
        <p
            class="mt-10 uppercase text-lg lg:text-xl font-light text-white whitespace-nowrap"
            style="letter-spacing: 0.45em; transform: translateX(-30px);"
        >
            {tagline}
        </p>
    </div>
</div>
