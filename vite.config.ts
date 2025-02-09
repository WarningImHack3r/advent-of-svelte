import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import lucidePreprocess from "vite-plugin-lucide-preprocess";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [lucidePreprocess(), sveltekit(), tailwindcss()]
});
