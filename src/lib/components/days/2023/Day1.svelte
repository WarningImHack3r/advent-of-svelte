<script lang="ts">
import { tick } from "svelte";
import { Check, ChevronsUpDown, Frown, Gift, Loader2 } from "lucide-svelte";
import { cn } from "$lib/utils";
import { Button } from "$lib/components/ui/button";
import * as Card from "$lib/components/ui/card";
import * as Command from "$lib/components/ui/command";
import * as Popover from "$lib/components/ui/popover";

export let kids: Promise<{ name: string; tally: number }[]>;
let search = "";
let open = false;

// We want to refocus the trigger button when the user selects
// an item from the list so users can continue navigating the
// rest of the form with the keyboard.
function closeAndFocusTrigger(triggerId: string) {
	open = false;
	tick().then(() => {
		document.getElementById(triggerId)?.focus();
	});
}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Tally Tracker</Card.Title>
		<Card.Description>
			Search for a child to check if they've been nice or naughty this year.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#await kids}
			<span class="flex items-center">
				<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				Loading...
			</span>
		{:then kids}
			<Popover.Root bind:open={open} let:ids>
				<Popover.Trigger asChild let:builder>
					<div class="flex items-center justify-between">
						<Button
							builders={[builder]}
							variant="outline"
							role="combobox"
							aria-expanded={open}
							class="w-[200px] justify-between"
						>
							{kids.find(f => f.name === search)?.name ?? "Select a child..."}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
						<p class="text-muted-foreground">
							<span class="font-semibold text-accent-foreground">
								{kids.filter(f => f.tally > 0).length}
							</span>
							nice children •{" "}
							<span class="font-semibold text-accent-foreground">
								{kids.filter(f => f.tally < 0).length}
							</span> naughty children
						</p>
					</div>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root>
						<Command.Input placeholder="Search children..." />
						<Command.Empty>No child found.</Command.Empty>
						<Command.Group class="max-h-48 overflow-y-auto">
							{#each kids as kid}
								<Command.Item
									value={kid.name}
									onSelect={(currentValue) => {
										search = currentValue;
										closeAndFocusTrigger(ids.trigger);
									}}
								>
									<Check class={cn(
											"mr-2 h-4 w-4",
											search !== kid.name && "text-transparent"
										)} />
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
							<Gift class="h-6 w-6 text-primary" />
						{:else}
							<Frown class="h-6 w-6 text-red-500" />
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
