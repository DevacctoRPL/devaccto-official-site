import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const dev = process.env.NODE_ENV === "development";

const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    paths: {
      base: dev ? "" : "/devaccto-official-site",
    },
    prerender: {
      handleHttpError: "ignore",
    },
  },
};

export default config;
