<script module lang="ts">
	export type Task = {
		elf: string;
		task: "CREATED_TOY" | "WRAPPED_PRESENT";
		minutesTaken: number;
		date: string;
	};
</script>

<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { page } from "$app/state";
	import { ArrowRight, Gauge } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";

	function stringFromTaskType(task: Task["task"]) {
		switch (task) {
			case "CREATED_TOY":
				return "created a toy";
			case "WRAPPED_PRESENT":
				return "wrapped a present";
		}
	}

	function findMostProductiveElf(tasks: Task[]) {
		let obj: Record<string, number> = {};
		let maxCount, maxElf;
		for (let task of tasks) {
			obj[task.elf] = (obj[task.elf] || 0) + 1;
			if (!maxCount || obj[task.elf]! > maxCount) {
				maxElf = task.elf;
				maxCount = obj[task.elf];
			}
		}
		return maxElf;
	}

	let tasks = $state<Task[]>([]);
	async function getElfTasks() {
		return await fetch("https://advent.sveltesociety.dev/data/2023/day-five.json").then(
			res => res.json() as Promise<Task[]>
		);
	}

	// Reactive variables
	let toysPerHour = $state("--");
	let minutesPerToy = $state("--");
	let mostProductiveElf = $state("--");
	let completionRate = $state("--");
	let lastUpdate = $state("loading...");
	$effect(() => {
		if (tasks.length > 0) {
			const totalMinutes = tasks.reduce((acc, task) => acc + task.minutesTaken, 0);
			const totalToys = tasks.filter(task => task.task === "CREATED_TOY").length;
			const totalPresents = tasks.filter(task => task.task === "WRAPPED_PRESENT").length;
			toysPerHour = (totalToys / (totalMinutes / 60)).toFixed(2);
			minutesPerToy = (totalMinutes / totalToys).toFixed(2);
			mostProductiveElf = findMostProductiveElf(tasks) || "--";
			completionRate = ((totalPresents / totalToys) * 100).toFixed(2);

			const latestTask = tasks[tasks.length - 1]!;
			let dateDiff = new Date().getTime() - new Date(latestTask.date).getTime();
			let relevantUnit: Intl.RelativeTimeFormatUnit;
			switch (true) {
				case dateDiff < 1000 * 60:
					dateDiff /= 1000;
					relevantUnit = "seconds";
					break;
				case dateDiff < 1000 * 60 * 60:
					dateDiff /= 1000 * 60;
					relevantUnit = "minutes";
					break;
				case dateDiff < 1000 * 60 * 60 * 24:
					dateDiff /= 1000 * 60 * 60;
					relevantUnit = "hours";
					break;
				case dateDiff < 1000 * 60 * 60 * 24 * 7:
					dateDiff /= 1000 * 60 * 60 * 24;
					relevantUnit = "days";
					break;
				case dateDiff < 1000 * 60 * 60 * 24 * 7 * 4:
					dateDiff /= 1000 * 60 * 60 * 24 * 7;
					relevantUnit = "weeks";
					break;
				case dateDiff < 1000 * 60 * 60 * 24 * 7 * 4 * 12:
					dateDiff /= 1000 * 60 * 60 * 24 * 7 * 4;
					relevantUnit = "months";
					break;
				default:
					dateDiff /= 1000 * 60 * 60 * 24 * 7 * 4 * 12;
					relevantUnit = "years";
					break;
			}
			const taskSuffixString = ` - ${latestTask.elf} ${stringFromTaskType(latestTask.task)}`;
			lastUpdate =
				new Intl.RelativeTimeFormat("en", {
					style: "long"
				}).format(-Math.ceil(dateDiff), relevantUnit) + taskSuffixString;
		}
	});

	let interval: ReturnType<typeof setInterval>;
	onMount(async () => {
		tasks = await getElfTasks();
		interval = setInterval(async () => {
			tasks = await getElfTasks();
		}, 1000);
	});

	onDestroy(() => clearInterval(interval));
</script>

<Card.Root class="flex flex-col">
	<Card.Header class="flex flex-row items-center justify-between gap-2">
		<div class="flex flex-col gap-1.5">
			<Card.Title class="flex items-center gap-2">
				<Gauge class="text-primary" />
				Elf Productivity Dashboard
			</Card.Title>
			<Card.Description>
				Keep an eye on your elves' productivity with this dashboard.
			</Card.Description>
		</div>
		<Button class="group hidden sm:flex" href="{page.route.id ?? ''}/productivity-dashboard">
			<span class="mr-2">More info</span>
			<ArrowRight class="duration-300 group-hover:translate-x-1.5" />
		</Button>
	</Card.Header>
	<Card.Content class="relative flex flex-1 items-center">
		<!-- Highlighted stats -->
		<div class="mb-16 grid w-full grid-cols-2 gap-8 xs:max-md:mb-10 lg:mb-10">
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{toysPerHour}</span>
				<span class="text-muted-foreground uppercase">toys per hour</span>
			</div>
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{minutesPerToy}</span>
				<span class="text-muted-foreground uppercase">minutes per toy</span>
			</div>
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{mostProductiveElf}</span>
				<span class="text-muted-foreground uppercase">most productive elf</span>
			</div>
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{completionRate}%</span>
				<span class="text-muted-foreground uppercase">completion rate</span>
			</div>
		</div>
		<!-- Last activity marquee -->
		<div
			class="absolute right-0 bottom-0 left-0 rounded-b-lg border-t bg-background px-3 py-1.5 font-mono text-primary"
		>
			Last update: {lastUpdate}
		</div>
	</Card.Content>
</Card.Root>
