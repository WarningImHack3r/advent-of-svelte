<script lang="ts">
	import { page } from "$app/state";
	import { Club, Play } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="flex flex-col">
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Club class="text-primary" />
			Memory Game
		</Card.Title>
		<Card.Description>Use the Deck of Doubles to play a memory game!</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-1 items-center justify-center">
		<Button href="{page.route.id ?? ''}/memory-game" class="group w-full">
			Play
			<Play class="ml-2 size-4 duration-300 group-hover:scale-110" />
		</Button>
	</Card.Content>
</Card.Root>
