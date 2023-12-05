<script lang="ts">
import { onDestroy, onMount } from "svelte";
import { Gauge } from "lucide-svelte";
import * as Card from "$lib/components/ui/card";

type Task = {
	elf: string;
	task: "CREATED_TOY" | "WRAPPED_PRESENT";
	minutesTaken: number;
	date: string;
};
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
		obj[task.elf] = ++obj[task.elf] || 1;
		if (!maxCount || obj[task.elf]! > maxCount) {
			maxElf = task.elf;
			maxCount = obj[task.elf];
		}
	}
	return maxElf;
}

let tasks: Task[] = [];
async function getElfTasks() {
	return await fetch("https://advent.sveltesociety.dev/data/2023/day-five.json").then(
		res => res.json() as Promise<Task[]>
	);
}

// Reactive variables
let toysPerHour = "--";
let minutesPerToy = "--";
let mostProductiveElf = "--";
let completionRate = "--";
let lastUpdate = "loading...";
$: if (tasks.length > 0) {
	const totalMinutes = tasks.reduce((acc, task) => acc + task.minutesTaken, 0);
	const totalToys = tasks.filter(task => task.task === "CREATED_TOY").length;
	const totalPresents = tasks.filter(task => task.task === "WRAPPED_PRESENT").length;
	toysPerHour = (totalToys / (totalMinutes / 60)).toFixed(2);
	minutesPerToy = (totalMinutes / totalToys).toFixed(2);
	mostProductiveElf = findMostProductiveElf(tasks) || "--";
	completionRate = ((totalPresents / totalToys) * 100).toFixed(2);
	const latestTask = tasks[tasks.length - 1]!;
	lastUpdate =
		new Intl.RelativeTimeFormat("en", {
			style: "short"
		}).format(
			-Math.ceil(new Date().getTime() / 1000 - new Date(latestTask.date).getTime() / 1000),
			"seconds"
		) +
		" - " +
		latestTask.elf +
		" " +
		stringFromTaskType(latestTask.task);
}

let interval: ReturnType<typeof setInterval>;
onMount(async () => {
	tasks = await getElfTasks();
	interval = setInterval(async () => {
		tasks = await getElfTasks();
	}, 1000);
});

onDestroy(() => {
	clearInterval(interval);
});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Gauge class="text-primary" />
			Elf Productivity Dashboard
		</Card.Title>
		<Card.Description>
			Keep an eye on your elves' productivity with this dashboard.
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<!-- Highlighted stats -->
		<div class="grid grid-cols-2 gap-8">
			<!-- toys/hour, time/toy, most productive elf, completion rate -->
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{toysPerHour}</span>
				<span class="uppercase text-muted-foreground">toys per hour</span>
			</div>
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{minutesPerToy}</span>
				<span class="uppercase text-muted-foreground">minutes per toy</span>
			</div>
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{mostProductiveElf}</span>
				<span class="uppercase text-muted-foreground">most productive elf</span>
			</div>
			<div class="flex flex-col">
				<span class="text-4xl font-semibold tracking-tighter">{completionRate}%</span>
				<span class="uppercase text-muted-foreground">completion rate</span>
			</div>
		</div>
		<!-- Last activity marquee -->
		<div
			class="-mx-6 -mb-6 mt-6 rounded-b-lg border-t bg-background px-3 py-1.5 font-mono text-primary"
		>
			Last update: {lastUpdate}
		</div>
	</Card.Content>
</Card.Root>
