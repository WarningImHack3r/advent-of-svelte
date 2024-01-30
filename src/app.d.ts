import { EventHandler } from "svelte/elements";
import type { DndEvent } from "svelte-dnd-action";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		"on:consider"?: EventHandler<CustomEvent<DndEvent>, T>;
		"on:finalize"?: EventHandler<CustomEvent<DndEvent>, T>;
	}
}

export {};
