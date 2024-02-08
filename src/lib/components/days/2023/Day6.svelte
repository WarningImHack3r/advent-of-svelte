<script lang="ts">
	import { onDestroy } from "svelte";
	import BoomBox from "lucide-svelte/icons/boom-box";
	import { cn } from "$lib/utils";
	import * as Card from "$lib/components/ui/card";
	import { buttonVariants } from "$lib/components/ui/button";

	const christmasSongs = [
		"https://www.youtube.com/watch?v=aAkMkVFwAoo",
		"https://www.youtube.com/watch?v=bwNV7TAWN3M",
		"https://www.youtube.com/watch?v=hLf0-lro8X8",
		"https://www.youtube.com/watch?v=sE3uRRFVsmc",
		"https://www.youtube.com/watch?v=A4zBSnMhvI0"
	];

	let lastTap = 0;
	const defaultBPMText = "Tap the button!";
	let bpmText = defaultBPMText;
	let timeout: ReturnType<typeof setTimeout>;

	function countBPM() {
		const now = Date.now();
		const bpm = (1 / ((now - lastTap) / 1000)) * 60;
		lastTap = now;
		bpmText = Math.floor(bpm).toString();

		clearTimeout(timeout);
		timeout = setTimeout(() => {
			bpmText = defaultBPMText;
		}, 5000);
	}

	onDestroy(() => clearTimeout(timeout));
</script>

<Card.Root class="flex flex-col">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<BoomBox class="text-primary" />
			BPM Counter
		</Card.Title>
		<Card.Description>Tap multiple times to find out your BPM.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-1 flex-col items-center justify-center">
		<button
			type="button"
			class="relative my-4 flex aspect-square h-52 select-none flex-col items-center justify-center gap-1 rounded-full bg-accent text-center text-2xl font-light tracking-tight shadow-md duration-300 transform-style-3d before:absolute
			before:inset-0 before:animate-pulse before:rounded-full before:bg-accent/75 before:shadow-md before:content-[''] before:-translate-z-1 before:scale-110 after:absolute after:inset-0 after:animate-pulse after:rounded-full after:bg-accent/50 after:shadow-md after:content-[''] after:-translate-z-2 after:scale-[1.2] hover:scale-105 active:scale-95"
			class:text-6xl={bpmText !== defaultBPMText}
			class:!font-semibold={bpmText !== defaultBPMText}
			on:click={countBPM}
		>
			{bpmText}
			{#if bpmText !== defaultBPMText}
				<span class="text-lg font-normal uppercase tracking-normal text-muted-foreground">BPM</span>
			{/if}
		</button>
		<span class="mt-6 text-center tracking-tight text-muted-foreground">
			You might like
			<a
				href={christmasSongs[Math.floor(Math.random() * christmasSongs.length)]}
				target="_blank"
				class={cn(
					buttonVariants({
						variant: "link"
					}),
					"h-auto p-0 text-base"
				)}
			>
				this Christmas song
			</a>
		</span>
	</Card.Content>
</Card.Root>
