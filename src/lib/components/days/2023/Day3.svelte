<script lang="ts">
import { blur, fly } from "svelte/transition";
import { CheckSquare2, Loader2, Square } from "lucide-svelte";
import * as Card from "$lib/components/ui/card";

export let presents: Promise<{ name: string; weight: number }[]>;

const MAX_WEIGHT = 100;
let selectedPresents: Awaited<typeof presents> = [];
let sleighWeight = 0;
$: sleighWeight =
	Math.round(
		(selectedPresents.reduce((acc, present) => acc + present.weight, 0) + Number.EPSILON) * 100
	) / 100;

let wasLastAdded = false;
let weightLabel = "";
$: setTimeout(() => {
	weightLabel =
		sleighWeight > MAX_WEIGHT
			? "Too heavy!"
			: sleighWeight > MAX_WEIGHT / 2
			  ? sleighWeight > MAX_WEIGHT * 0.9
					? sleighWeight > MAX_WEIGHT * 0.99
						? "Ready to go!"
						: "Almost there!"
					: "Kids will be happy!"
			  : sleighWeight > 0
			    ? "Let's pack more!"
			    : "Empty sleigh";
}, 25);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Sleigh Load Balancer</Card.Title>
		<Card.Description>Choose which present to include in your run with the SLB™!</Card.Description>
	</Card.Header>
	<Card.Content>
		{#await presents}
			<span class="flex items-center">
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				Loading...
			</span>
		{:then presents}
			<div class="flex flex-col gap-4 lg:flex-row">
				<Card.Root class="min-w-max">
					<Card.Header>
						<Card.Title>Current weight</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex items-baseline justify-center gap-2 text-xl text-muted-foreground">
							<div class="grid grid-cols-1 grid-rows-1">
								{#key sleighWeight}
									<span
										class="col-start-1 col-end-1 row-start-1 row-end-1 text-5xl font-semibold tabular-nums tracking-tighter text-accent-foreground"
										class:text-red-500={sleighWeight > MAX_WEIGHT}
										transition:blur
									>
										{sleighWeight.toFixed(sleighWeight > MAX_WEIGHT ? 1 : 2)}
									</span>
								{/key}
							</div>
							kg
						</div>
						<div class="mt-2 grid grid-cols-1 grid-rows-1">
							{#key weightLabel}
								<span
									class="col-start-1 col-end-1 row-start-1 row-end-1 text-center text-sm text-muted-foreground"
									class:text-primary={sleighWeight <= MAX_WEIGHT && sleighWeight > MAX_WEIGHT * 0.99}
									class:text-red-500={sleighWeight > MAX_WEIGHT}
									in:fly={{y: -20 * (wasLastAdded ? 1 : -1)}}
									out:fly={{y: 20 * (wasLastAdded ? 1 : -1)}}
								>
									{weightLabel}
								</span>
							{/key}
						</div>
					</Card.Content>
				</Card.Root>
				<div class="grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto">
					{#each presents as present}
						<div
							class="relative rounded-lg border bg-card text-card-foreground shadow-sm"
							class:border-primary={selectedPresents.includes(present)}
						>
							<input
								type="checkbox"
								class="peer absolute left-0 top-0 h-full w-full cursor-pointer opacity-0"
								on:change={(e) => {
									const checked = e.target?.checked ?? false;
									wasLastAdded = checked;
									if (checked) {
										selectedPresents = [...selectedPresents, present];
									} else {
										selectedPresents = selectedPresents.filter(p => p !== present);
									}
								}}
							/>
							<div class="flex min-w-max flex-col px-6 py-4 peer-checked:text-primary">
								<div class="flex items-center gap-2">
									{#if selectedPresents.includes(present)}
										<CheckSquare2 class="h-4 w-4 text-primary" />
									{:else}
										<Square class="h-4 w-4" />
									{/if}
									<span>{present.name}</span>
								</div>
								<span class="text-muted-foreground">{present.weight} kg</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:catch error}
			<p>{error.message}</p>
		{/await}
	</Card.Content>
</Card.Root>
