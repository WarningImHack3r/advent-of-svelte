<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import { ChevronLeft, Club } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import { Slider } from "$lib/components/ui/slider";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import * as Card from "$lib/components/ui/card";
	import * as Tooltip from "$lib/components/ui/tooltip";

	// Grid definition
	const gridPossibilities = {
		"2x2": [2, 2],
		"2x3": [2, 3],
		"4x4": [4, 4],
		"4x5": [4, 5],
		"5x6": [5, 6],
		"6x6": [6, 6],
		"6x7": [6, 7],
		"6x8": [6, 8]
	} as const;
	let gridWidth = 4;
	let gridHeight = 4;
	let cards: number[] = [];
	$: cards = Array.from({ length: 24 }, (_, i) => i + 1) // 1 to 24
		.sort(() => Math.random() - 0.5) // shuffle
		.slice(0, (gridWidth * gridHeight) / 2) // take the correct amount of cards
		.flatMap(n => [n, n]) // duplicate
		.sort(() => Math.random() - 0.5); // reshuffle

	// Game state
	let firstCard: number | null = null;
	let secondCard: number | null = null;
	let firstCardIndex: number | null = null;
	let secondCardIndex: number | null = null;
	let pairsFoundIndex: number[] = [];

	let ready = true;
	let gameStarted = false;
	let timerStarted = false;
	let timer = 0;
	let interval: ReturnType<typeof setInterval>;

	let cooldown = 2500;
	let tries = 0;
	let score = 0;

	function hideCards(callback?: () => void) {
		firstCard = null;
		secondCard = null;
		firstCardIndex = null;
		secondCardIndex = null;
		setTimeout(() => callback?.(), 700);
	}

	function resetGame(reshuffle = false) {
		if (reshuffle) ready = false;
		hideCards(() => {
			if (reshuffle) {
				gridWidth++;
				gridWidth--;
				ready = true;
			}
		});
		pairsFoundIndex = [];
		gameStarted = false;
		timerStarted = false;
		clearInterval(interval);
		timer = 0;
		tries = 0;
		if (score > (localStorageHighScore ?? 0)) {
			localStorage.setItem("memory-game-high-score", score.toString());
			localStorageHighScore = score;
		}
		score = 0;
	}

	function calculateScore() {
		const baseScorePerPair = 100;
		const timeFactor = 500;
		const tryPenalty = 50;

		const pairsFound = pairsFoundIndex.length / 2;
		const baseScore = pairsFound * baseScorePerPair;
		const timeScore = Math.max(0, timeFactor - timer * (timeFactor / 60));
		const tryScore = Math.max(0, tryPenalty * (pairsFound - tries));

		return Math.floor(baseScore + timeScore + tryScore);
	}

	$: if ((firstCard !== null || secondCard !== null) && !gameStarted) {
		gameStarted = true;
		timerStarted = true;
		interval = setInterval(() => {
			timer++;
		}, 1000);
	}

	$: if (firstCard !== null && secondCard !== null) {
		// Two cards have been flipped
		tries++;
		if (firstCard === secondCard) {
			// Match
			pairsFoundIndex = [...pairsFoundIndex, firstCardIndex!, secondCardIndex!];
			// The score is the percentage of pairs found compared to the time it took to find them
			score = calculateScore();
			hideCards();
			if (pairsFoundIndex.length === cards.length) {
				// All pairs found
				timerStarted = false;
				clearInterval(interval);
			}
		} else {
			// Reset
			setTimeout(hideCards, cooldown);
		}
	}

	let localStorageHighScore: number | null;
	onMount(() => {
		localStorageHighScore = localStorage.getItem("memory-game-high-score")
			? parseInt(localStorage.getItem("memory-game-high-score")!)
			: null;
	});

	onDestroy(() => clearInterval(interval));
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
			<Club class="text-primary" />
			<div class="flex flex-col">
				<Card.Title>Memory Game</Card.Title>
				<Card.Description>Use the Deck of Doubles to play a memory game!</Card.Description>
			</div>
		</Card.Header>
		<Card.Content>
			<div
				class="mt-8 flex flex-col gap-8 lg:mb-8 lg:grid lg:grid-cols-2"
				class:max-lg:!flex-col-reverse={!timerStarted && gameStarted}
			>
				<!-- Playing field -->
				<div
					class="m-auto grid gap-4"
					style="grid-template-columns: repeat({gridWidth}, max-content);"
				>
					{#each cards as number, index}
						{@const isFlipped =
							pairsFoundIndex.includes(index) ||
							firstCardIndex === index ||
							secondCardIndex === index}
						<button
							type="button"
							on:click={() => {
								if (firstCard === null) {
									firstCard = number;
									firstCardIndex = index;
								} else if (secondCard === null) {
									secondCard = number;
									secondCardIndex = index;
								}
							}}
							class="aspect-[7/10] h-32 shadow-lg duration-200 perspective-1000 [&:not(:disabled)]:hover:scale-105"
							class:brightness-75={firstCard !== null && secondCard !== null && !isFlipped}
							disabled={!ready
								? true
								: firstCard !== null && secondCard !== null
									? true
									: isFlipped}
						>
							<div
								class="relative size-full transition-transform duration-700 transform-style-3d"
								class:rotate-y-180={isFlipped}
							>
								<!-- Back -->
								<div
									class="absolute flex size-full flex-col items-center justify-center rounded-lg bg-accent backface-hidden"
								>
									<Club class="size-12 text-primary drop-shadow-lg" />
								</div>
								<!-- Front -->
								<div class="absolute size-full rotate-y-180 backface-hidden">
									{#await fetch(`https://advent.sveltesociety.dev/data/2023/day-eight/${number}.png`)}
										<Skeleton class="rounded-lg" />
									{:then res}
										<img src={res.url} alt="Card {number}" />
									{:catch _}
										<div class="rounded-lg bg-background">{number}</div>
									{/await}
								</div>
							</div>
						</button>
					{/each}
				</div>
				{#if timerStarted}
					<!-- Scoreboard -->
					<Card.Root class="bg-accent/50">
						<Card.Content class="pt-6 text-xl">
							<h2 class="mb-8 border-b pb-2 text-3xl font-semibold tracking-tight">Game info</h2>
							<!-- Duration -->
							<p>
								<span class="font-bold">Game duration:</span>
								<span class="tabular-nums">
									{Math.floor(timer / 60)}:{Math.floor(timer % 60).toLocaleString(undefined, {
										minimumIntegerDigits: 2
									})}
								</span>
							</p>
							<!-- Tries -->
							<p><span class="font-bold">Tries:</span> {tries}</p>
							<!-- Score -->
							<p><span class="font-bold">Score:</span> {score}</p>
							<!-- High score -->
							<p>
								<span class="font-bold">High score:</span>
								{localStorageHighScore ?? 0}
							</p>
							<AlertDialog.Root>
								<AlertDialog.Trigger asChild let:builder>
									<Button
										builders={[builder]}
										variant="destructive"
										class="mt-8 lg:mt-16"
										disabled={tries < 1}
									>
										Restart game
									</Button>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Restart game</AlertDialog.Title>
										<AlertDialog.Description>
											Are you sure you want to restart the game? All progress will be lost.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
										<AlertDialog.Action on:click={() => resetGame(true)}>
											Restart
										</AlertDialog.Action>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</Card.Content>
					</Card.Root>
				{:else if gameStarted}
					<!-- Win screen -->
					<div class="flex flex-col items-center justify-center text-center">
						<h2 class="mb-8 text-7xl font-semibold tracking-tight">You won!</h2>
						<p>
							<span class="font-bold">Game duration:</span>
							<span class="tabular-nums">
								{Math.floor(timer / 60)}:{Math.floor(timer % 60).toLocaleString(undefined, {
									minimumIntegerDigits: 2
								})}
							</span>
						</p>
						<p><span class="font-bold">Tries:</span> {tries}</p>
						<p><span class="font-bold">Score:</span> {score}</p>
						<p>
							<span class="font-bold">High score:</span>
							{localStorageHighScore ?? 0}
						</p>
						{#if score > (localStorageHighScore ?? 0)}
							<p class="mt-4">
								<span class="font-bold italic">New high score: {score}</span>
							</p>
						{/if}
						<Button class="mt-16" on:click={() => resetGame(true)}>Start a new game</Button>
					</div>
				{:else}
					<!-- Game configuration -->
					<Card.Root class="bg-accent/50">
						<Card.Content class="pt-6 text-xl">
							<h2 class="mb-8 border-b pb-2 text-3xl font-semibold tracking-tight">
								Game configuration
							</h2>
							<!-- Grid size -->
							<p><span class="font-bold">Grid size:</span> {gridWidth}x{gridHeight}</p>
							<Slider
								max={Object.keys(gridPossibilities).length - 1}
								step={1}
								value={[Object.keys(gridPossibilities).indexOf(`${gridWidth}x${gridHeight}`)]}
								onValueChange={([value]) => {
									[gridWidth, gridHeight] =
										gridPossibilities[Object.keys(gridPossibilities)[value]];
									resetGame();
								}}
								class="mt-4"
							/>
							<!-- Cooldown -->
							<p class="mt-8"><span class="font-bold">Cooldown:</span> {cooldown / 1000}s</p>
							<Slider
								min={500}
								max={5000}
								step={500}
								value={[cooldown]}
								onValueChange={([value]) => {
									cooldown = value;
								}}
								class="mt-4"
							/>
							<p class="mt-12 text-lg italic text-muted-foreground">
								Start the game by flipping a card.
							</p>
						</Card.Content>
					</Card.Root>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</div>
