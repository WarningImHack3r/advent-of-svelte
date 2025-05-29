<script lang="ts">
	import { Check, ChevronsUpDown, Frown, Gift } from "@lucide/svelte";
	import { cn } from "$lib/utils";
	import { Button } from "$lib/components/ui/button";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Card from "$lib/components/ui/card";
	import * as Command from "$lib/components/ui/command";
	import * as Popover from "$lib/components/ui/popover";

	type Props = {
		kids: Promise<{ name: string; tally: number }[]>;
	};

	let { kids }: Props = $props();
	let search = $state("");
	let open = $state(false);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Gift class="text-primary" />
			Tally Tracker
		</Card.Title>
		<Card.Description>
			Search for a child to check if they've been nice or naughty this year.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#await kids}
			<div class="flex flex-col gap-4">
				<div class="flex items-center justify-between">
					<Skeleton class="h-10 w-1/3" />
					<Skeleton class="h-6 w-1/2" />
				</div>
				<Skeleton class="h-32 w-full" />
			</div>
		{:then kids}
			<Popover.Root bind:open>
				<Popover.Trigger>
					{#snippet child({ props })}
						<div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
							<Button
								{...props}
								variant="outline"
								role="combobox"
								aria-expanded={open}
								class="w-52 justify-between"
							>
								{kids.find(f => f.name === search)?.name ?? "Select a child..."}
								<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
							</Button>
							<p class="text-muted-foreground">
								<span class="font-semibold text-accent-foreground">
									{kids.filter(f => f.tally > 0).length}
								</span>
								nice children •
								<span class="font-semibold text-accent-foreground">
									{kids.filter(f => f.tally < 0).length}
								</span> naughty children
							</p>
						</div>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-52 p-0">
					<Command.Root>
						<Command.Input placeholder="Search children..." />
						<Command.Empty>No child found.</Command.Empty>
						<Command.Group class="max-h-48 overflow-y-auto">
							{#each kids as kid, i (i)}
								<Command.Item
									value={kid.name}
									onSelect={() => {
										search = kid.name;
										open = false;
									}}
								>
									<Check class={cn("mr-2 size-4", search !== kid.name && "text-transparent")} />
									{kid.name}
									<span class="ml-auto text-muted-foreground">{kid.tally}</span>
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			{#if search}
				{@const tally = kids.find(f => f.name === search)?.tally ?? 0}
				<Card.Root class="mt-4">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<div>
							<Card.Title>{search}</Card.Title>
							<Card.Description>
								{tally}
								{tally === 1 ? "tally" : "tallies"}
							</Card.Description>
						</div>
						{#if tally > 0}
							<Gift class="size-6 text-primary" />
						{:else}
							<Frown class="size-6 text-red-500" />
						{/if}
					</Card.Header>
					<Card.Content>
						{#if tally > 0}
							{search} has been {tally >= 50 ? "very" : ""} nice this year.
						{:else}
							{search} has been {tally <= -50 ? "very" : ""} naughty this year.
						{/if}
					</Card.Content>
				</Card.Root>
			{/if}
		{:catch error}
			<p class="text-red-500">Error: {error.message}</p>
		{/await}
	</Card.Content>
</Card.Root>
