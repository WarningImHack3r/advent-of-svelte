<script lang="ts">
import type { PageData } from "./$types";
import * as Tabs from "$lib/components/ui/tabs";
import Day1 from "$lib/components/days/2023/Day1.svelte";
import Day2 from "$lib/components/days/2023/Day2.svelte";
import Day3 from "$lib/components/days/2023/Day3.svelte";
import Day4 from "$lib/components/days/2023/Day4.svelte";
import Day5 from "$lib/components/days/2023/Day5.svelte";
import Day6 from "$lib/components/days/2023/Day6.svelte";
import Day7 from "$lib/components/days/2023/Day7.svelte";
import Day8 from "$lib/components/days/2023/Day8.svelte";

export let data: PageData;

const dashboards = {
	santa: "Santa's",
	elves: "Elves"
};
let currentDashboard: keyof typeof dashboards = "santa";
</script>

<div class="container py-8">
	<h2 class="text-3xl font-bold tracking-tight">{dashboards[currentDashboard]} Dashboard</h2>
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
				<Day3 presents={data.streamed.presents} />
				<Day4 />
				<Day7 />
				<Day8 />
			</div>
		</Tabs.Content>
		<Tabs.Content value="elves">
			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4
				lg:[&>*:nth-child(1)]:col-span-2 lg:[&>*:nth-child(2)]:col-span-2"
			>
				<Day1 kids={data.streamed.kids} />
				<Day5 />
				<Day6 />
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
