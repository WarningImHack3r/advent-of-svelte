<script lang="ts">
	import { ChevronLeft, Snowflake } from "lucide-svelte";
	import Snowflakes from "$lib/components/Snowflakes.svelte";
	import Day15 from "$lib/components/days/2023/Day15.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Checkbox } from "$lib/components/ui/checkbox";
	import { Label } from "$lib/components/ui/label";
	import * as Card from "$lib/components/ui/card";
	import * as Tooltip from "$lib/components/ui/tooltip";

	type Image = {
		src: string;
		alt: string;
		show: boolean;
	};
	const imagesToShow = $state<Image[]>([
		{
			src: "https://www.freeiconspng.com/uploads/snowman-png-29.png",
			alt: "Snowman",
			show: true
		},
		{
			src: "https://www.freeiconspng.com/uploads/christmas-tree-icon-0.png",
			alt: "Christmas tree",
			show: false
		},
		{
			src: "https://www.freeiconspng.com/uploads/transparent-santa-claus-2.png",
			alt: "Santa Claus",
			show: false
		}
	]);

	let borderHex = $state("#000000");
	let fillHex = $state("#ffffff");
</script>

<div class="container my-8">
	<Card.Root>
		<Card.Header class="flex flex-row items-center gap-4 space-y-0">
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<Button {...props} size="icon" href="." class="mr-6">
							<ChevronLeft />
						</Button>
					{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>Back to the dashboard</Tooltip.Content>
			</Tooltip.Root>
			<Snowflake class="text-primary" />
			<div class="flex flex-col">
				<Card.Title>Snow Globe Creator</Card.Title>
				<Card.Description
					>Create your snow globe you can share with your friends and family.</Card.Description
				>
			</div>
		</Card.Header>
		<Card.Content class="flex flex-col gap-8">
			<!-- Globe -->
			<Day15 class="relative mx-auto h-96 w-[22rem]" fill={fillHex} color={borderHex}>
				<Snowflakes class="size-full rounded-full" />
				<div class="absolute inset-0 mb-6 flex items-end justify-center">
					{#each imagesToShow as { src, alt, show }}
						{#if show}
							<img {src} {alt} class="h-12 align-bottom" />
						{/if}
					{/each}
				</div>
			</Day15>
			<!-- Settings -->
			<section class="flex flex-col gap-4">
				<h2 class="text-2xl">Settings</h2>
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-4">
						<span class="font-semibold">Figures to show:</span>
						{#each imagesToShow as { alt }, index}
							<div class="flex items-center space-x-2">
								<Checkbox id={index.toString()} bind:checked={imagesToShow[index]!.show} />
								<Label for={index.toString()}>{alt}</Label>
							</div>
						{/each}
					</div>
					<div class="flex items-center gap-4">
						<span class="font-semibold">Border color:</span>
						{#if borderHex}
							<input type="color" bind:value={borderHex} />
						{/if}
					</div>
					<div class="flex items-center gap-4">
						<span class="font-semibold">Fill color:</span>
						{#if fillHex}
							<input type="color" bind:value={fillHex} />
						{/if}
					</div>
				</div>
			</section>
		</Card.Content>
	</Card.Root>
</div>
