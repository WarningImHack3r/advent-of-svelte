<script lang="ts">
import { onMount } from "svelte";
import { crossfade } from "svelte/transition";
import { Languages, Play, Square } from "lucide-svelte";
import { cn } from "$lib/utils";
import { buttonVariants } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import { Separator } from "$lib/components/ui/separator";
import * as Card from "$lib/components/ui/card";

// Morse
const morseCode: Record<string, string> = {
	a: ".-",
	b: "-...",
	c: "-.-.",
	d: "-..",
	e: ".",
	f: "..-.",
	g: "--.",
	h: "....",
	i: "..",
	j: ".---",
	k: "-.-",
	l: ".-..",
	m: "--",
	n: "-.",
	o: "---",
	p: ".--.",
	q: "--.-",
	r: ".-.",
	s: "...",
	t: "-",
	u: "..-",
	v: "...-",
	w: ".--",
	x: "-..-",
	y: "-.--",
	z: "--..",
	" ": "/",
	"1": ".----",
	"2": "..---",
	"3": "...--",
	"4": "....-",
	"5": ".....",
	"6": "-....",
	"7": "--...",
	"8": "---..",
	"9": "----.",
	"0": "-----",
	".": ".-.-.-",
	",": "--..--",
	"?": "..--..",
	"'": ".----.",
	"/": "-..-.",
	"(": "-.--.",
	")": "-.--.-",
	"&": ".-...",
	":": "---...",
	";": "-.-.-.",
	"=": "-...-",
	"+": ".-.-.",
	"-": "-....-",
	_: "..--.-",
	'"': ".-..-.",
	$: "...-..-",
	"!": "-.-.--",
	"@": ".--.-."
};

function translateToMorseCode(message: string) {
	return message
		.toLowerCase()
		.split("")
		.map(char => morseCode[char] || char)
		.join(" ");
}

let message = "Hello World!";
$: if (message || !message) {
	stop();
}

// Audio transcription of the Morse code
let isPlaying = false;
let elapsedTime = "0:00";
let totalTime = "0:00";
let intervalId: ReturnType<typeof setInterval>;
const [send, receive] = crossfade({
	duration: 800
});
const key = "morse-code-translator";

let audioContext: AudioContext;
let oscillator: OscillatorNode;
let gainNode: GainNode;
onMount(() => {
	audioContext = new AudioContext();
});

function play() {
	if (!audioContext) return;
	if (isPlaying) stop();
	oscillator = audioContext.createOscillator();
	oscillator.frequency.value = 800;
	gainNode = audioContext.createGain();
	gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1);

	oscillator.connect(gainNode);
	gainNode.connect(audioContext.destination);

	const morseCode = translateToMorseCode(message);
	const timeUnit = 100;
	const dot = timeUnit;
	const dash = timeUnit * 3;
	const intraCharSpace = timeUnit;
	const letterSpace = timeUnit * 3;
	const wordSpace = timeUnit * 7;

	let time = audioContext.currentTime;
	for (const char of morseCode) {
		switch (char) {
			case ".":
				gainNode.gain.setValueAtTime(0.5, time);
				time += dot / 1000;
				gainNode.gain.setValueAtTime(0, time);
				break;
			case "-":
				gainNode.gain.setValueAtTime(0.5, time);
				time += dash / 1000;
				gainNode.gain.setValueAtTime(0, time);
				break;
			case " ":
				time += wordSpace / 1000;
				break;
			default:
				time += letterSpace / 1000;
		}
		time += intraCharSpace / 1000;
	}

	let total = time - audioContext.currentTime;
	totalTime = `0:${Math.round(total).toLocaleString(undefined, {
		minimumIntegerDigits: 2,
		useGrouping: false
	})}`;
	intervalId = setInterval(() => {
		let elapsed = audioContext.currentTime - (time - total);
		elapsedTime = `0:${Math.round(elapsed).toLocaleString(undefined, {
			minimumIntegerDigits: 2,
			useGrouping: false
		})}`;
		if (elapsed >= total) {
			clearInterval(intervalId);
		}
	}, 500);

	isPlaying = true;
	oscillator.start(audioContext.currentTime);
	oscillator.stop(time);
	oscillator.onended = () => {
		isPlaying = false;
	};
}

function stop() {
	if (!oscillator || !gainNode || !isPlaying) return;
	isPlaying = false;
	clearInterval(intervalId);
	oscillator.stop();
	oscillator.disconnect();
	gainNode.disconnect();
}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Languages class="text-primary" />
			Morse Code Translator
		</Card.Title>
		<Card.Description>Translate your message to Morse code to send it to Sven.</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-4">
		<Input placeholder="Your message" bind:value={message} />
		<div>
			{#if message.length > 0}
				<p class="text-sm text-muted-foreground">Your message in Morse code:</p>
			{/if}
			<pre class="mt-1 whitespace-pre-wrap">{translateToMorseCode(message)}</pre>
			<Separator class="my-4" />
			<div class="flex flex-col">
				<p class="mb-2 text-sm text-muted-foreground">Play your Morse message:</p>
				<div class="flex items-center gap-1">
					<div class="grid grid-cols-1 grid-rows-1">
						{#if isPlaying}
							<button
								class={cn(buttonVariants({
									variant: "ghost",
									size: "icon",
								}), "col-start-1 col-end-1 row-start-1 row-end-1")}
								in:send={{ key }}
								out:receive={{ key }}
								on:click={stop}
							>
								<Square class="text-primary" />
							</button>
						{:else}
							<button
								class={cn(buttonVariants({
									variant: "ghost",
									size: "icon",
								}), "col-start-1 col-end-1 row-start-1 row-end-1")}
								in:send={{ key }}
								out:receive={{ key }}
								on:click={play}
							>
								<Play class="text-primary" />
							</button>
						{/if}
					</div>
					{#if isPlaying}
						<p class="tabular-nums text-muted-foreground">{elapsedTime}/{totalTime}</p>
					{/if}
				</div>
			</div>
		</div>
	</Card.Content>
</Card.Root>
