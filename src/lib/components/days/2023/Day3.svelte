<script lang="ts">
	import { blur, fly } from "svelte/transition";
	import { Square, SquareCheck, Weight } from "lucide-svelte";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Card from "$lib/components/ui/card";
	import * as Tabs from "$lib/components/ui/tabs";

	export let presents: Promise<{ name: string; weight: number }[]>;
	export let presents_v2: Promise<{ name: string; weight: number }[]>;

	const MAX_WEIGHT = 100;

	// Day 3
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

	// Day 13
	// Returns a promise that resolves to an array of deliveries,
	// each containing a list of presents to deliver.
	// The total weight of each delivery does not exceed MAX_WEIGHT.
	// Each delivery should be as close to MAX_WEIGHT as possible, minimizing
	// the number of deliveries required.
	// Each present can only be included in a single delivery.
	async function autoCompute() {
		const presents = (await presents_v2).sort((a, b) => b.weight - a.weight);
		const deliveries: (typeof presents)[] = [];
		let currentDelivery: typeof presents = [];
		let currentWeight = 0;
		for (const present of presents) {
			if (currentWeight + present.weight > MAX_WEIGHT) {
				deliveries.push(currentDelivery);
				currentDelivery = [];
				currentWeight = 0;
			}
			currentDelivery.push(present);
			currentWeight += present.weight;
		}
		deliveries.push(currentDelivery);
		return deliveries;
	}
</script>

<Card.Root class="flex flex-col">
	<Tabs.Root>
		<Card.Header class="flex items-center justify-between gap-2 xs:flex-row">
			<div class="flex flex-col gap-1.5">
				<Card.Title class="flex items-center gap-2">
					<Weight class="text-primary" />
					Sleigh Load Balancer
				</Card.Title>
				<Card.Description>
					Choose which present to include in your run with the SLB™!
				</Card.Description>
			</div>
			<Tabs.List>
				<Tabs.Trigger value="manual">Manual</Tabs.Trigger>
				<Tabs.Trigger value="auto">Auto</Tabs.Trigger>
			</Tabs.List>
		</Card.Header>
		<Tabs.Content value="manual" class="mt-0">
			<Card.Content class="my-auto pr-0">
				{#await presents}
					<div class="flex flex-col gap-4 lg:flex-row">
						<Skeleton class="mr-6 aspect-square h-44 lg:mr-0" />
						<div class="grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto pr-6">
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
							{#each Array(8) as _}
								<Skeleton class="h-full w-32" />
							{/each}
						</div>
					</div>
				{:then presents}
					<div class="flex flex-col gap-4 lg:flex-row">
						<Card.Root class="mr-6 min-w-max border-2 bg-accent/25 lg:mr-0">
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
											class:text-primary={sleighWeight <= MAX_WEIGHT &&
												sleighWeight > MAX_WEIGHT * 0.99}
											class:text-red-500={sleighWeight > MAX_WEIGHT}
											in:fly={{ y: -20 * (wasLastAdded ? 1 : -1) }}
											out:fly={{ y: 20 * (wasLastAdded ? 1 : -1) }}
										>
											{weightLabel}
										</span>
									{/key}
								</div>
							</Card.Content>
						</Card.Root>
						<div class="grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto pr-6">
							{#each presents as present, i}
								<div
									class="relative rounded-lg border bg-card text-card-foreground shadow-sm"
									class:border-primary={selectedPresents.includes(present)}
								>
									<input
										name="Present {i + 1}"
										type="checkbox"
										class="peer absolute left-0 top-0 size-full cursor-pointer opacity-0"
										on:change={e => {
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
												<SquareCheck class="size-4 text-primary" />
											{:else}
												<Square class="size-4 text-primary" />
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
		</Tabs.Content>
		<Tabs.Content value="auto" class="mt-0">
			<Card.Content class="flex flex-col gap-8 pb-0 xs:flex-row">
				{#await autoCompute()}
					<div class="flex flex-1 flex-col gap-2 overflow-hidden">
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{#each Array(2) as _}
							<Skeleton class="h-[5.6rem] w-full" />
						{/each}
					</div>
					<div class="flex min-w-fit flex-col justify-center gap-4 pb-6">
						<div class="flex flex-col gap-2">
							<Skeleton class="h-10 w-36" />
							<Skeleton class="h-6 w-40" />
						</div>
						<div class="flex flex-col gap-2">
							<Skeleton class="h-10 w-20" />
							<Skeleton class="h-6 w-[11.5rem]" />
						</div>
					</div>
				{:then data}
					<!-- Deliveries list -->
					<div class="flex max-h-[12.5rem] flex-col gap-2 overflow-y-auto overflow-x-hidden">
						{#each data.slice(0, 100) as delivery, i}
							<Card.Root class="bg-accent/75 py-4">
								<Card.Header class="flex-row items-baseline gap-1.5 space-y-0 px-4 pb-2 pt-0">
									<Card.Title>Delivery {i + 1}</Card.Title> •
									<Card.Description class="text-base text-primary">
										{delivery.reduce((acc, present) => acc + present.weight, 0).toFixed(2)}kg
									</Card.Description>
								</Card.Header>
								<Card.Content class="overflow-x-auto text-nowrap p-0 px-4">
									{#each delivery as present, i}
										{#if i > 0}
											<span class="text-muted-foreground"> • </span>
										{/if}
										<span>{present.name} ({present.weight}kg)</span>
									{/each}
								</Card.Content>
							</Card.Root>
						{/each}
						<p class="mx-auto pb-2 text-center italic text-muted-foreground">
							For performance reasons, only the first 100 deliveries are displayed.
						</p>
					</div>
					<!-- Stats -->
					<div class="flex min-w-fit flex-col justify-center gap-4 pb-6">
						<div class="flex flex-col">
							<span>
								<span class="text-4xl font-semibold tracking-tighter">
									{(
										data.reduce(
											(acc, delivery) =>
												acc + delivery.reduce((acc, present) => acc + present.weight, 0),
											0
										) / data.length
									).toFixed(2)}
								</span>
								<span class="text-3xl font-medium text-muted-foreground">kg</span>
							</span>
							<span class="uppercase text-muted-foreground">avg. sled weight</span>
						</div>
						<div class="flex flex-col">
							<span class="text-4xl font-semibold tracking-tighter">
								{data.length}
							</span>
							<span class="uppercase text-muted-foreground">number of deliveries</span>
						</div>
					</div>
				{:catch error}
					<p>{error.message}</p>
				{/await}
			</Card.Content>
		</Tabs.Content>
	</Tabs.Root>
</Card.Root>
