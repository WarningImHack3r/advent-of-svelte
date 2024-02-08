<script lang="ts">
	import { onMount } from "svelte";
	import AlarmClock from "lucide-svelte/icons/alarm-clock";
	import { Confetti } from "svelte-confetti";
	import * as Card from "$lib/components/ui/card";

	let days = -1;
	let hours = -1;
	let minutes = -1;
	let seconds = -1;

	function updateTimer() {
		const now = new Date();
		const christmas = new Date(now.getFullYear(), 11, 24);
		const diff = christmas.getTime() - now.getTime();

		if (diff < 0) {
			// if we are past the 25th of December, set the date to next year
			if (now.getMonth() === christmas.getMonth() && now.getDate() > christmas.getDate() + 1) {
				christmas.setFullYear(now.getFullYear() + 1);
			} else {
				days = 0;
				hours = 0;
				minutes = 0;
				seconds = 0;
				return clearInterval(interval);
			}
		}

		days = Math.floor(diff / (1000 * 60 * 60 * 24));
		hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
		minutes = Math.floor((diff / 1000 / 60) % 60);
		seconds = Math.floor((diff / 1000) % 60);
	}

	const interval = setInterval(updateTimer, 1000);

	onMount(() => {
		updateTimer();
		() => clearInterval(interval);
	});
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<AlarmClock class="text-primary" />
			Final Countdown
		</Card.Title>
		<Card.Description>Keep an eye on the time left until the Christmas Eve!</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="text-center text-4xl font-semibold">
			{#if days === 0 && hours === 0 && minutes === 0 && seconds === 0}
				<div class="flex flex-col items-center">
					<Confetti
						rounded
						infinite
						x={[-1, 1]}
						y={[-0.5, 1]}
						colorArray={["white", "hsl(var(--primary))", "orange"]}
					/>
					<span class="motion-safe:animate-bounce-and-spin-y">Christmas is here!</span>
				</div>
			{:else}
				{#if days !== 0}
					<span class="tabular-nums tracking-tighter">{days < 0 ? "--" : days}</span><span
						class="text-3xl font-light text-muted-foreground"
					>
						d
					</span>
				{/if}
				{#if days !== 0 || hours !== 0}
					<span class="tabular-nums tracking-tighter">{hours < 0 ? "--" : hours}</span><span
						class="text-3xl font-light text-muted-foreground"
					>
						h
					</span>
				{/if}
				{#if days !== 0 || hours !== 0 || minutes !== 0}
					<span class="tabular-nums tracking-tighter">{minutes < 0 ? "--" : minutes}</span><span
						class="text-3xl font-light text-muted-foreground"
					>
						m
					</span>
				{/if}
				<span class="tabular-nums tracking-tighter">{seconds < 0 ? "--" : seconds}</span><span
					class="text-3xl font-light text-muted-foreground"
				>
					s
				</span>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
