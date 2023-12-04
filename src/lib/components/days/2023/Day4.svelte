<script lang="ts">
import { onDestroy, onMount } from "svelte";
import { blur } from "svelte/transition";
import { Heart, HeartPulse } from "lucide-svelte";
import { VisLine, VisXYContainer } from "@unovis/svelte";
import * as Card from "$lib/components/ui/card";

let heartRate = 0;
let data: { id: number; heartRate: number }[] = [];
async function getHeartRate() {
	const response = await fetch("https://advent.sveltesociety.dev/data/2023/day-four.json").then(
		res => res.json() as Promise<{ heartRate: number }>
	);
	return response.heartRate;
}

let interval: ReturnType<typeof setInterval>;
onMount(async () => {
	heartRate = await getHeartRate();
	data = [{ id: 0, heartRate }];
	interval = setInterval(async () => {
		heartRate = await getHeartRate();
		data = [...data, { id: data.length, heartRate }];
	}, 1000);
});

onDestroy(() => {
	clearInterval(interval);
});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<HeartPulse class="text-primary" />
			Santa's Heart Rate Monitor
		</Card.Title>
		<Card.Description>Check live Santa's heart rate with the SHRM™!</Card.Description>
	</Card.Header>
	<Card.Content class="relative flex flex-col items-center justify-center gap-2">
		<div class="grid grid-cols-1 grid-rows-1">
			{#key heartRate}
				<span
					class="col-start-1 col-end-1 row-start-1 row-end-1 text-center text-7xl font-semibold tracking-tighter"
					transition:blur
				>
					{heartRate}
				</span>
			{/key}
		</div>
		<Heart class="h-12 w-12 text-pink-500 motion-safe:animate-pulse" />
		<div class="absolute bottom-4 right-0 w-full overflow-x-hidden" dir="rtl">
			<VisXYContainer data={data} width={data.length * 10} height={40}>
				<VisLine
					x={(d) => d.id}
					y={(d) => d.heartRate}
					duration={0}
					color={() => "rgb(236 72 153 / .2)"}
				/>
			</VisXYContainer>
		</div>
	</Card.Content>
</Card.Root>
