<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { ArrowDownAZ, ArrowDownZA, ArrowUpDown } from "@lucide/svelte";
	import { type SortDirection } from "@tanstack/table-core";
	import { Button } from "$lib/components/ui/button";

	type Props = ComponentProps<typeof Button> & {
		name: string;
		sortingOrder: SortDirection | false;
	};

	let { name, sortingOrder, variant = "ghost", ...restProps }: Props = $props();
</script>

<Button {variant} {...restProps}>
	{name}
	{#if sortingOrder === "asc"}
		<ArrowDownAZ class="ml-2 text-accent-foreground" />
	{:else if sortingOrder === "desc"}
		<ArrowDownZA class="ml-2 text-accent-foreground" />
	{:else}
		<ArrowUpDown class="ml-2" />
	{/if}
</Button>
