<script lang="ts">
	import { page } from "$app/stores";
	import { ChevronRight, type Component, ScrollText, Snowflake } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import * as Card from "$lib/components/ui/card";

	type Diy = {
		icon: typeof Component;
		name: string;
		description: string;
		url: string;
	};
	const diys: Diy[] = [
		{
			icon: ScrollText,
			name: "Christmas card creator",
			description: "Create your own Christmas card and send it to Santa!",
			url: "/card-creator"
		},
		{
			icon: Snowflake,
			name: "Snow globe creator",
			description: "Create your snow globe you can share with your friends and family.",
			url: "/snow-globe-creator"
		}
	];
</script>

<div class="container my-16 max-w-4xl">
	<h2 class="text-3xl font-bold tracking-tight">
		<span class="text-primary">DIY</span>s
	</h2>
	<Card.Root class="mt-4 pt-6">
		<Card.Content>
			<ul>
				{#each diys as diy, index}
					<li class="flex flex-col justify-between gap-4 sm:flex-row">
						<div class="flex gap-6">
							<svelte:component this={diy.icon} class="size-12 min-w-8 text-primary" />
							<div class="flex flex-col">
								<h4 class="text-lg font-semibold">{diy.name}</h4>
								<p class="text-muted-foreground">{diy.description}</p>
							</div>
						</div>
						<Button href={$page.url + diy.url} variant="outline" class="ml-auto self-center">
							Visit
							<ChevronRight class="ml-2 size-4" />
						</Button>
					</li>
					{#if index < diys.length - 1}
						<Separator class="my-6" />
					{/if}
				{/each}
			</ul>
		</Card.Content>
	</Card.Root>
</div>
