<script lang="ts">
	import { blur, fade, fly } from "svelte/transition";
	import { Cookie, Minus, Plus } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";

	let cookiesCount = $state(0);
	let lastAdjustmentPositive = $state(false);
	let cookiesLabel = $state("Cookie");
	let comment = $state("Santa hasn't eaten any cookies yet.");
	function updateCookiesCount(adjustment: number) {
		lastAdjustmentPositive = adjustment > 0;
		cookiesCount += adjustment;

		cookiesLabel = cookiesCount > 1 ? "Cookies" : "Cookie";
		if (cookiesCount >= 100) {
			comment = "Santa is definitely sick now.";
		} else if (cookiesCount >= 50) {
			comment = "Santa is going to be sick!";
		} else if (cookiesCount >= 25) {
			comment = "Santa is merry and full of cookies!";
		} else if (cookiesCount >= 10) {
			comment = "Santa has eaten a lot of cookies!";
		} else if (cookiesCount >= 5) {
			comment = "Santa has eaten a few cookies.";
		} else if (cookiesCount > 0) {
			comment = "Santa has eaten some cookies.";
		} else {
			comment = "Santa hasn't eaten any cookies yet.";
		}
	}
</script>

<Card.Root>
	<Card.Header class="pb-4">
		<Card.Title class="flex items-center gap-2">
			<Cookie class="text-primary" />
			Cookie Counter
		</Card.Title>
		<Card.Description>Keep track of how many cookies Santa has eaten!</Card.Description>
	</Card.Header>
	<Card.Content class="pb-2">
		<div class="flex items-center justify-center space-x-2">
			<Button
				variant="outline"
				size="icon"
				class="size-8 shrink-0 rounded-full"
				onclick={() => updateCookiesCount(-1)}
				disabled={cookiesCount <= 0}
			>
				<Minus class="size-4" />
				<span class="sr-only">Decrease</span>
			</Button>
			<div class="flex-1 text-center">
				<div class="grid grid-cols-1 grid-rows-1">
					{#key cookiesCount}
						<span
							class="col-start-1 col-end-1 row-start-1 row-end-1 text-5xl font-bold tracking-tighter"
							transition:blur
						>
							{cookiesCount}
						</span>
					{/key}
				</div>
				<div class="grid grid-cols-1 grid-rows-1">
					{#key cookiesLabel}
						<span
							class="col-start-1 col-end-1 row-start-1 row-end-1 text-xs text-muted-foreground uppercase"
							transition:fade
						>
							{cookiesLabel}
						</span>
					{/key}
				</div>
			</div>

			<Button
				variant="outline"
				size="icon"
				class="size-8 shrink-0 rounded-full"
				onclick={() => updateCookiesCount(1)}
			>
				<Plus class="size-4" />
				<span class="sr-only">Increase</span>
			</Button>
		</div>
	</Card.Content>
	<Card.Footer class="mt-4 flex flex-col gap-4">
		<div class="grid grid-cols-1 grid-rows-1">
			{#key comment}
				<p
					class="col-start-1 col-end-1 row-start-1 row-end-1 text-center text-sm text-muted-foreground"
					in:fly={{ y: -20 * (lastAdjustmentPositive ? 1 : -1) }}
					out:fly={{ y: 20 * (lastAdjustmentPositive ? 1 : -1) }}
				>
					{comment}
				</p>
			{/key}
		</div>
		<Button
			class="w-full"
			onclick={() => updateCookiesCount(-cookiesCount)}
			disabled={cookiesCount === 0}
		>
			Reset
		</Button>
	</Card.Footer>
</Card.Root>
