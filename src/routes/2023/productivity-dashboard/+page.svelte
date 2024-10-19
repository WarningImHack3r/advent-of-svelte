<script lang="ts">
	import { ChevronLeft, Gauge } from "lucide-svelte";
	import {
		VisAxis,
		VisBulletLegend,
		VisCrosshair,
		VisGroupedBar,
		VisLine,
		VisTooltip,
		VisXYContainer
	} from "@unovis/svelte";
	import type { Task } from "$lib/components/days/2023/Day5.svelte";
	import DataTable from "./DataTable.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Separator } from "$lib/components/ui/separator";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import * as Card from "$lib/components/ui/card";
	import * as Tooltip from "$lib/components/ui/tooltip";

	let container: HTMLDivElement;

	function tasksToByElf(tasks: Task[]) {
		const tasksByElf: { id: number; elf: string; numberOfTasks: number }[] = [];

		tasks.forEach(task => {
			const elf = tasksByElf.find(elf => elf.elf === task.elf);
			if (elf) {
				elf.numberOfTasks++;
			} else {
				tasksByElf.push({ id: tasksByElf.length, elf: task.elf, numberOfTasks: 1 });
			}
		});

		return tasksByElf;
	}

	function tasksToByDay(tasks: Task[]) {
		const tasksByDay: {
			id: number;
			dayHour: string;
			tasks: { elf: string; numberOfTasks: number }[];
		}[] = [];

		tasks.forEach(task => {
			const taskDate = new Date(task.date);
			taskDate.setMinutes(0, 0, 0);
			const day = tasksByDay.find(day => {
				return taskDate.toISOString() === day.dayHour;
			});
			if (day) {
				const elf = day.tasks.find(elf => elf.elf === task.elf);
				if (elf) {
					elf.numberOfTasks++;
				} else {
					day.tasks.push({ elf: task.elf, numberOfTasks: 1 });
				}
			} else {
				tasksByDay.push({
					id: tasksByDay.length,
					dayHour: taskDate.toISOString(),
					tasks: [{ elf: task.elf, numberOfTasks: 1 }]
				});
			}
		});

		return tasksByDay;
	}
</script>

<div class="container my-8">
	<Card.Root>
		<Card.Header class="flex flex-row items-center gap-4">
			<Tooltip.Root>
				<Tooltip.Trigger asChild let:builder>
					<Button builders={[builder]} size="icon" href="." class="mr-6">
						<ChevronLeft />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>Back to the dashboard</Tooltip.Content>
			</Tooltip.Root>
			<Gauge class="text-primary" />
			<div class="flex flex-col">
				<Card.Title>Elf Productivity Dashboard</Card.Title>
				<Card.Description>
					Keep an eye on your elves' productivity with this dashboard.
				</Card.Description>
			</div>
		</Card.Header>
		<Card.Content>
			<div
				class="container mx-auto py-10"
				bind:this={container}
				style="--vis-tooltip-background-color: hsl(var(--card)); --vis-tooltip-text-color: hsl(var(--accent-foreground));"
			>
				{#await fetch("https://advent.sveltesociety.dev/data/2023/day-five.json").then( res => res.json() )}
					<!-- History -->
					<Skeleton class="h-10 w-28" />
					<div class="flex items-center gap-4 py-4">
						<Skeleton class="h-10 w-full max-w-sm" />
						<Skeleton class="ml-auto h-10 w-28" />
					</div>
					<Skeleton class="h-[36rem] w-full" />
					<div class="flex items-center py-4">
						<Skeleton class="h-4 w-44" />
						<Skeleton class="ml-auto h-10 w-1/3" />
					</div>
					<Separator class="my-8" />
					<!-- Tops -->
					<div class="flex w-full flex-col items-center justify-between gap-8 md:flex-row md:gap-0">
						<div class="flex w-full flex-col gap-4 md:w-1/3">
							<Skeleton class="h-10 w-4/5" />
							<Skeleton class="h-80 w-full" />
						</div>
						<Separator orientation="vertical" class="hidden h-72 md:block" />
						<div class="flex w-full flex-col items-end gap-4 md:w-1/3">
							<Skeleton class="h-10 w-4/5" />
							<Skeleton class="h-80 w-full" />
						</div>
					</div>
					<Separator class="my-8" />
					<!-- Stats -->
					<Skeleton class="h-10 w-28" />
					<div class="mt-8 flex flex-wrap justify-center gap-8">
						<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
						{#each Array(8) as _}
							<Skeleton class="h-28 w-56" />
						{/each}
					</div>
					<Separator class="my-8" />
					<!-- Production graph by elf -->
					<div class="flex flex-col items-center gap-4">
						<Skeleton class="mr-auto h-10 w-1/3" />
						<Skeleton class="h-72 w-full" />
						<Skeleton class="h-6 w-11/12" />
						<Skeleton class="h-6 w-1/3" />
					</div>
				{:then data}
					{@const orderedElves = tasksToByElf(data)
						.sort((a, b) => b.numberOfTasks - a.numberOfTasks)
						.map((elf, index) => ({ ...elf, id: index }))}
					{@const orderedDays = tasksToByDay(data).sort(
						(a, b) => new Date(a.dayHour).getTime() - new Date(b.dayHour).getTime()
					)}
					{@const elves = new Set(data.map(d => d.elf))}
					{@const stats = [
						{ title: "Total task fulfilled", value: data.length },
						{ title: "Total elves", value: elves.size },
						{
							title: "Total toys created",
							value: data.filter(d => d.task === "CREATED_TOY").length
						},
						{
							title: "Total presents wrapped",
							value: data.filter(d => d.task === "WRAPPED_PRESENT").length
						},
						{
							title: "Average time to produce a toy",
							value:
								Math.round(
									data.reduce((acc, task) => acc + task.minutesTaken, 0) /
										data.filter(task => task.task === "CREATED_TOY").length
								) + " min"
						},
						{
							title: "Average time to wrap a toy",
							value:
								Math.round(
									data.reduce((acc, task) => acc + task.minutesTaken, 0) /
										data.filter(task => task.task === "WRAPPED_PRESENT").length
								) + " min"
						},
						{
							title: "Elf with the most tasks in a day",
							value: orderedDays.reduce((acc, day) => {
								const max = day.tasks.reduce((a, b) => (a.numberOfTasks > b.numberOfTasks ? a : b));
								return acc.numberOfTasks > max.numberOfTasks ? acc : max;
							}).elf
						},
						{
							title: "Cumulative time spent on tasks",
							value:
								Math.round(data.reduce((acc, task) => acc + task.minutesTaken, 0) / 60 / 24) +
								" days"
						}
					]}
					<!-- History -->
					<h2 class="text-3xl font-bold">History</h2>
					<DataTable tableData={data} />
					<Separator class="my-8" />
					<!-- Tops -->
					<div class="flex w-full flex-col items-center justify-between md:flex-row">
						<div class="-ml-6 flex w-full flex-col xs:ml-0 md:w-1/3">
							<h2 class="text-3xl font-bold">Most productive elves</h2>
							<div class="flex gap-8">
								<div class="my-6 max-w-[50%] md:max-w-full">
									<VisXYContainer data={orderedElves.slice(0, 3)} yDirection="south" height={220}>
										<VisGroupedBar
											orientation="horizontal"
											roundedCorners={5}
											x={d => d.id}
											y={d => d.numberOfTasks}
											color={d => ["#c9b037", "#b4b4b4", "#6a3805"][d.id]}
										/>
									</VisXYContainer>
								</div>
								<div class="my-6 flex flex-col gap-8">
									{#each orderedElves.slice(0, 3) as rank}
										<div class="flex flex-col">
											<p class="text-xl font-bold">{rank.elf}</p>
											<p class="text-gray-500">{rank.numberOfTasks} tasks</p>
										</div>
									{/each}
								</div>
							</div>
						</div>
						<Separator orientation="vertical" class="hidden h-72 md:block" />
						<div class="-mr-6 flex w-full flex-col text-right xs:mr-0 md:w-1/3">
							<h2 class="text-3xl font-bold">Least productive elves</h2>
							<div class="flex justify-end gap-8">
								<div class="my-6 flex flex-col gap-8">
									{#each orderedElves.slice(-3).reverse() as rank}
										<div class="flex flex-col">
											<p class="text-xl font-bold">{rank.elf}</p>
											<p class="text-gray-500">{rank.numberOfTasks} tasks</p>
										</div>
									{/each}
								</div>
								<div class="my-6 max-w-[50%] -scale-x-100 md:max-w-full">
									<VisXYContainer data={orderedElves.slice(-3)} height={220}>
										<VisGroupedBar
											orientation="horizontal"
											roundedCorners={5}
											x={d => d.id}
											y={d => d.numberOfTasks}
											color={d => ["#ef4444", "#b91c1c", "#7f1d1d"][d.id - orderedElves.length + 3]}
										/>
									</VisXYContainer>
								</div>
							</div>
						</div>
					</div>
					<Separator class="my-8" />
					<!-- Stats -->
					<h2 class="text-3xl font-bold">Stats</h2>
					<div class="mt-8 flex flex-wrap justify-center gap-8">
						{#each stats as stat}
							<Card.Root class="max-w-fit bg-accent/75">
								<Card.Header>
									<Card.Title class="text-nowrap text-muted-foreground">{stat.title}</Card.Title>
								</Card.Header>
								<Card.Content class="text-4xl font-bold">
									{stat.value}
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
					<Separator class="my-8" />
					<!-- Production graph by elf -->
					<h2 class="text-3xl font-bold">Production graph by elf</h2>
					<div class="mt-8 w-full">
						<VisXYContainer data={orderedDays}>
							<VisLine
								x={d => new Date(d.dayHour).getTime()}
								y={[...elves].map(elf => {
									return d => d.tasks.find(task => task.elf === elf)?.numberOfTasks ?? 0;
								})}
							/>
							<VisAxis
								type="x"
								label="Date"
								x={d => d.dayHour}
								tickFormat={d =>
									new Date(d).toLocaleTimeString([], {
										year: "numeric",
										month: "numeric",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit"
									})}
							/>
							<VisAxis type="y" label="Production" numTicks={8} />
							<VisTooltip {container} />
							<VisCrosshair
								template={d => {
									const date = new Date(d.dayHour).toLocaleTimeString([], {
										year: "numeric",
										month: "numeric",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit"
									});
									const bestElf = d.tasks.reduce((a, b) =>
										a.numberOfTasks > b.numberOfTasks ? a : b
									);
									const worstElf = d.tasks.reduce((a, b) =>
										a.numberOfTasks < b.numberOfTasks ? a : b
									);
									return `${date} • Best elf: ${bestElf.elf} (${bestElf.numberOfTasks} task${
										bestElf.numberOfTasks > 1 ? "s" : ""
									}) / Worst elf: ${worstElf.elf} (${worstElf.numberOfTasks} task${
										worstElf.numberOfTasks > 1 ? "s" : ""
									})`;
								}}
							/>
						</VisXYContainer>
						<div class="ml-8 mt-4 text-center">
							<VisBulletLegend items={[...elves].map(elf => ({ name: elf }))} />
						</div>
					</div>
				{:catch error}
					<p class="text-red-500">Something went wrong. ({error.message})</p>
				{/await}
			</div>
		</Card.Content>
	</Card.Root>
</div>
