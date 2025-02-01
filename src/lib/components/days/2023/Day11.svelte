<script lang="ts">
	import { onMount } from "svelte";
	import { Dices } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Card from "$lib/components/ui/card";

	let firstNames: string[] = [];
	let lastNames: string[] = [];
	let realName = $state("");
	let error = $state("");
	let elfName = $state("");

	function generateName() {
		const [firstName, lastName] = realName.split(" ");
		if (!firstName || !lastName) return;
		const first =
			firstNames.find(
				name =>
					name.startsWith(lastName[0]!.toUpperCase()) &&
					name.length >= Math.max(5, firstName.length)
			) ?? firstNames.find(name => name.length >= Math.max(5, firstName.length));
		const last =
			lastNames.find(
				name =>
					name.startsWith(lastName[0]!.toUpperCase()) &&
					name.length >= Math.max(6, lastName.length - 2)
			) ?? lastNames.find(name => name.length >= Math.max(6, lastName.length - 2));
		if (!first || !last) {
			error = "Failed to get your elf name :(";
			return;
		}
		elfName = `${first} ${last}`;
	}

	type NamesList = {
		firstNames: string[];
		lastNames: string[];
	};

	onMount(async () => {
		const res = await fetch("https://advent.sveltesociety.dev/data/2023/day-eleven.json");
		if (!res.ok) error = "Failed to fetch names list.";
		const data = (await res.json()) as NamesList;
		firstNames = data.firstNames;
		lastNames = data.lastNames;
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Dices class="text-primary" />
			Elf Name Generator
		</Card.Title>
		<Card.Description>Generate your own elf name from your real name.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-8">
		<form
			class="flex items-center gap-2"
			onsubmit={e => {
				e.preventDefault();

				if (realName.length < 1) {
					error = "Please enter your name.";
				} else if (!realName.includes(" ")) {
					error = "Please enter your first name AND last name.";
				}

				if (!error) generateName();
			}}
		>
			<Input
				name="first-last-name"
				autocomplete="name"
				placeholder="Your first and last name"
				class="flex-1 bg-background"
				bind:value={realName}
				oninput={() => {
					error = "";
					elfName = "";
				}}
			/>
			<Button type="submit" size="icon" disabled={realName.length < 1}>
				<Dices class="size-5" />
				<span class="sr-only">Generate</span>
			</Button>
		</form>
		{#if error}
			<p class="text-red-500">{error}</p>
		{:else if elfName}
			<div class="flex flex-col gap-1">
				<h4 class="uppercase text-muted-foreground">Your elf name:</h4>
				<p class="text-2xl">{elfName}</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
