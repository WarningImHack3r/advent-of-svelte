<script lang="ts">
	import { page } from "$app/state";
	import { ChevronRight, Paintbrush } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Tabs from "$lib/components/ui/tabs";
	import Day1 from "$lib/components/days/2023/Day1.svelte";
	import Day2 from "$lib/components/days/2023/Day2.svelte";
	import Day3 from "$lib/components/days/2023/Day3.svelte";
	import Day4 from "$lib/components/days/2023/Day4.svelte";
	import Day5 from "$lib/components/days/2023/Day5.svelte";
	import Day6 from "$lib/components/days/2023/Day6.svelte";
	import Day7 from "$lib/components/days/2023/Day7.svelte";
	import Day8 from "$lib/components/days/2023/Day8.svelte";
	import Day9 from "$lib/components/days/2023/Day9.svelte";
	import Day11 from "$lib/components/days/2023/Day11.svelte";

	let { data } = $props();

	const dashboards = {
		santa: "Santa's",
		elves: "Elves"
	} as const;
	let currentDashboard = $state<keyof typeof dashboards>("santa");
</script>

<div class="container my-8">
	<div class="flex items-center justify-between gap-4">
		<h2 class="text-3xl font-bold tracking-tight">
			<span class="text-primary">{dashboards[currentDashboard]}</span>
			Dashboard
		</h2>
		<Button href={page.url + "/diy"} class="group ml-auto xs:ml-0">
			<Paintbrush class="mr-2 size-6" />
			<span class="hidden sm:block">DIYs</span>
			<ChevronRight
				class="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1"
			/>
		</Button>
	</div>
	<Tabs.Root bind:value={currentDashboard} class="mt-8">
		<Tabs.List>
			<Tabs.Trigger value="santa">Santa</Tabs.Trigger>
			<Tabs.Trigger value="elves">Elves</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="santa">
			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4
				lg:[&>*:nth-child(2)]:col-span-2"
			>
				<Day2 />
				<Day3 presents={data.presents} presents_v2={data.presents_v2} />
				<Day4 />
				<Day7 />
				<Day8 />
				<Day9 />
			</div>
		</Tabs.Content>
		<Tabs.Content value="elves">
			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4
				lg:[&>*:nth-child(1)]:col-span-2 lg:[&>*:nth-child(2)]:col-span-2"
			>
				<Day1 kids={data.kids} />
				<Day5 />
				<Day6 />
				<Day11 />
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
