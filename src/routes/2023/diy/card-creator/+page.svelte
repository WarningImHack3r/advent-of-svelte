<script lang="ts">
	import { flip } from "svelte/animate";
	import { cubicIn } from "svelte/easing";
	import { fade } from "svelte/transition";
	import {
		type DndEvent,
		dndzone,
		type Item,
		SHADOW_ITEM_MARKER_PROPERTY_NAME,
		TRIGGERS
	} from "svelte-dnd-action";
	import { ChevronLeft, ScrollText } from "@lucide/svelte";
	import defaultTheme from "tailwindcss/defaultTheme";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import * as Tooltip from "$lib/components/ui/tooltip";

	// CONSTANTS
	const cardSize = 6 * 4;
	const flipDurationMs = 200;
	type AvailableItem = {
		name: string;
		type: "decoration" | "text";
	};
	const pictures = Array.from({ length: 11 }, (_, i) => ({
		name: `Decoration ${i + 1}`,
		type: "decoration",
		image: `https://advent.sveltesociety.dev/data/2023/day-twelve/${i + 1}.png`
	})) satisfies AvailableItem[];
	const textElement = {
		name: "Text",
		type: "text"
	} satisfies AvailableItem;

	// VARIABLES & TYPES
	type PossibleItem = (typeof pictures)[number] | typeof textElement;
	type RecursiveNonNullable<T> = { [K in keyof T]-?: RecursiveNonNullable<NonNullable<T[K]>> };
	let availableItems = $state(
		[
			...pictures.map(picture => ({
				id: `decoration`,
				item: picture
			})),
			...[
				{
					id: `text`,
					item: textElement
				}
			]
		].map((item, index) => ({ ...item, id: `${item.id}-${index}` })) satisfies RecursiveNonNullable<
			typeof placedItems
		>
	);
	let placedItems: {
		id: string;
		item: PossibleItem | null;
	}[] = $state(
		Array.from({ length: cardSize }, (_, i) => ({
			id: i.toString(),
			item: null
		}))
	);

	let currentCardBackground = $state(0);
	const cardBackgroundColors = [
		"hsl(var(--primary))",
		"darkorchid",
		"darkred",
		"darkcyan",
		"goldenrod",
		"currentColor",
		"gray"
	];
	const styles = {
		fonts: defaultTheme.fontFamily,
		colors: ["hsl(var(--foreground))", "red", "blue", "green", "orange"] as const,
		fontSizes: defaultTheme.fontSize
	};
	type TextAreaSettings = {
		fontFamily: keyof (typeof styles)["fonts"];
		textColor: (typeof styles)["colors"][number];
		fontSize: keyof (typeof styles)["fontSizes"];
	};
	const registeredTextAreas: Record<
		string,
		{
			element: HTMLTextAreaElement;
			settings: TextAreaSettings;
		}
	> = $state({});
	let focusedTextAreaId = $state<ReturnType<typeof crypto.randomUUID>>();
	let focusedTextArea = $state<(typeof registeredTextAreas)[keyof typeof registeredTextAreas]>();
	let textAreaFocusTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
	$effect(() => {
		if (focusedTextAreaId) focusedTextArea = registeredTextAreas[focusedTextAreaId]!;
	});

	// CALLBACKS & UTILS
	function idToInt(id: string) {
		return +(id.split("_")[0]?.split("-")[1] ?? "0");
	}

	let shouldIgnoreDndEvents = false;

	/**
	 * Callback for when the user drags an item over the available items.
	 * Never mutates the original array of available items, instead acts
	 * as a pile of infinite items to choose from.
	 * Creates a duplicate item instantly when the drag starts, and
	 * removes it when the drag ends.
	 * Uses a flag to ignore events based on the drag start event.
	 * @param event The event object
	 */
	function itemDropConsider(event: DndEvent) {
		let items = event.items as ((typeof availableItems)[number] & Item)[];
		if (event.info.trigger === TRIGGERS.DRAG_STARTED) {
			const idx = availableItems.findIndex(item => item.id === event.info.id);
			const newId = `${event.info.id}_copy_${Math.round(Math.random() * 100000)}`;
			items = items.filter(item => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME]);
			items.splice(idx, 0, { ...availableItems[idx]!, id: newId });
			availableItems = items.sort((a, b) => idToInt(a.id) - idToInt(b.id));
			shouldIgnoreDndEvents = true;
		} else if (!shouldIgnoreDndEvents) {
			availableItems = items
				.filter(item => !item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
				.sort((a, b) => idToInt(a.id) - idToInt(b.id));
		} else {
			availableItems = [...availableItems];
		}
	}

	/**
	 * Callback for when the user drops an item on the available items.
	 * Cleans up the items array by removing the shadow items, as a
	 * result of the consider callback.
	 * @param event The event object
	 */
	function itemDropEnd(event: DndEvent) {
		const items = event.items as typeof availableItems;
		if (!shouldIgnoreDndEvents) {
			availableItems = items.sort((a, b) => idToInt(a.id) - idToInt(b.id));
		} else {
			availableItems = [...availableItems];
			shouldIgnoreDndEvents = false;
		}
	}

	/**
	 * Callback for when the user drags an item over the card. Removes
	 * the last empty item if the card is full, instead of blindly
	 * removing the last item.
	 * @param event The event object
	 */
	function cardDropConsider(event: DndEvent) {
		const newItems = event.items as typeof placedItems;
		if (newItems.length === cardSize) {
			placedItems = newItems;
		} else if (newItems.length > cardSize) {
			// Adding an item to the card, removing the last empty item
			const lastEmptyItem = newItems.findLast(item => !item.item);
			placedItems = newItems.filter(item => item !== lastEmptyItem);
		} else {
			// Removing an item from the card, adding an empty item
			const largestEmptyItemId = +event.items
				.filter(item => item.item === null && !item[SHADOW_ITEM_MARKER_PROPERTY_NAME])
				.sort((a, b) => +a.id - +b.id)
				.findLast(Boolean)!.id;
			placedItems = newItems.concat(
				Array.from({ length: cardSize - newItems.length }, (_, i) => ({
					id: (largestEmptyItemId + i + 1).toString(),
					item: null
				}))
			);
		}
	}

	/**
	 * Callback for when the user drops an item on the card.
	 * @param event The event object
	 */
	function cardDropEnd(event: DndEvent) {
		placedItems = event.items as typeof placedItems;
	}

	function transformDraggedElement<T extends Item = { item?: PossibleItem }>(
		element: HTMLElement | undefined,
		data: T | undefined
	) {
		if (!element || !data || !data.item) return;
		switch (data.item.type) {
			case "decoration":
				element.innerHTML = `<img src="${data.item.image}" alt="${data.item.name}" class="h-full" />`;
				break;
			case "text":
				element.innerHTML = `<textarea placeholder="Enter your text here" class="size-full resize-none rounded-2xl bg-transparent p-2" />`;
				break;
		}
	}

	function textAreaFocused(element: EventTarget) {
		if (textAreaFocusTimeout) clearTimeout(textAreaFocusTimeout);
		let id = Object.keys(registeredTextAreas).find(
			key => registeredTextAreas[key]!.element === element
		) as ReturnType<typeof crypto.randomUUID> | undefined;
		if (!id) {
			id = crypto.randomUUID();
			registeredTextAreas[id] = {
				element: element as HTMLTextAreaElement,
				settings: {
					fontFamily: "sans",
					textColor: styles.colors[0],
					fontSize: "xs"
				}
			};
		}
		focusedTextAreaId = id;
	}

	function updateTextAreaStyle(textArea: NonNullable<typeof focusedTextArea>) {
		textArea.element.style.fontFamily = styles.fonts[textArea.settings.fontFamily].join(", ");
		textArea.element.style.color = textArea.settings.textColor;
		const fontSizeElement = styles.fontSizes[textArea.settings.fontSize][1];
		textArea.element.style.fontSize =
			typeof fontSizeElement === "string"
				? fontSizeElement
				: (fontSizeElement?.lineHeight ?? textArea.element.style.fontSize);
	}

	function textAreaUnfocused() {
		textAreaFocusTimeout = setTimeout(() => {
			focusedTextAreaId = undefined;
		}, 100);
	}

	/**
	 * TODO:
	 * - Handle multiple text zones sizes: complicated
	 * - Add decoration tilting?
	 */
</script>

<div class="container my-8">
	<Card.Root>
		<Card.Header class="flex flex-row items-center gap-4 space-y-0">
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#snippet child({ props })}
							<Button {...props} size="icon" href="." class="mr-6">
								<ChevronLeft />
							</Button>
						{/snippet}
					</Tooltip.Trigger>
					<Tooltip.Content>Back to the dashboard</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
			<ScrollText class="text-primary" />
			<div class="flex flex-col">
				<Card.Title>Christmas Card Creator</Card.Title>
				<Card.Description>Create your own Christmas card and send it to Santa!</Card.Description>
			</div>
		</Card.Header>
		<Card.Content class="flex flex-col gap-8">
			<!-- Items section -->
			<section
				class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl p-4"
				use:dndzone={{
					items: availableItems,
					flipDurationMs,
					transformDraggedElement,
					dropTargetStyle: {
						outline: "2px solid hsl(var(--accent))"
					}
				}}
				onconsider={e => itemDropConsider(e.detail)}
				onfinalize={e => itemDropEnd(e.detail)}
			>
				{#each availableItems.filter(item => item.item) as item (item.id)}
					{@const element = item.item}
					<div
						class="flex size-24 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 border-muted-foreground/50 bg-muted/75 text-center"
						animate:flip={{ duration: flipDurationMs }}
					>
						{#if element.type === "decoration"}
							<img src={element.image} alt={element.name} loading="lazy" class="h-16" />
							<span class="text-xs">{element.name}</span>
						{:else if element.type === "text"}
							<span class="text-6xl">T</span>
							<span class="text-xs">Text</span>
						{/if}
					</div>
				{/each}
			</section>
			<!-- Card background picker -->
			<div class="mx-auto flex items-center gap-4">
				<span class="font-semibold">Background color:</span>
				{#each cardBackgroundColors.entries() as [index, borderColor] (index)}
					<button
						aria-label="Background color"
						class={[
							"size-8 rounded-full outline-4 outline-offset-2 hover:outline hover:outline-foreground",
							{
								"outline outline-primary": index === currentCardBackground
							}
						]}
						style="background-color: {borderColor};"
						onclick={() => (currentCardBackground = index)}
					></button>
				{/each}
			</div>
			<!-- Card -->
			<section>
				<div
					class="mx-auto grid aspect-3/2 max-w-4xl grid-cols-6 grid-rows-4 rounded-2xl border-2 outline-offset-8"
					style="
					background-color: color-mix(in srgb, {cardBackgroundColors[
						currentCardBackground
					]} 75%, transparent);
					border-color: {cardBackgroundColors[currentCardBackground]};"
					use:dndzone={{
						items: placedItems,
						flipDurationMs,
						transformDraggedElement,
						dropTargetStyle: {
							outline: "2px solid hsl(var(--accent))"
						}
					}}
					onconsider={e => cardDropConsider(e.detail)}
					onfinalize={e => cardDropEnd(e.detail)}
				>
					{#each placedItems as item (item.id)}
						<div
							animate:flip={{ duration: flipDurationMs }}
							class={["relative flex items-center justify-center", item.item && "p-4"]}
						>
							{#if Object.hasOwn(item, SHADOW_ITEM_MARKER_PROPERTY_NAME)}
								<div
									in:fade={{ duration: flipDurationMs, easing: cubicIn }}
									class="visible absolute inset-0 rounded-2xl border border-dashed border-gray-500 bg-black/30"
								></div>
							{:else if item.item}
								{@const element = item.item}
								{#if element.type === "decoration"}
									<img src={element.image} alt={element.name} class="h-full" />
								{:else if element.type === "text"}
									<textarea
										placeholder="Enter your text here"
										onfocus={e => {
											const target = e.target;
											if (!target) return;
											textAreaFocused(target);
										}}
										onfocusout={textAreaUnfocused}
										class="size-full resize-none rounded-2xl bg-transparent p-2"
									></textarea>
								{/if}
								<!--{:else}-->
								<!-- DEBUG -->
								<!--								<div class="size-full rounded-full bg-black" />-->
							{/if}
						</div>
					{/each}
				</div>
			</section>
			<!-- Text area settings -->
			{#if focusedTextAreaId}
				<section class="flex flex-col gap-4">
					<h2 class="text-2xl">Text settings</h2>
					<div class="flex flex-col gap-4">
						<div class="flex items-center gap-4">
							<span class="font-semibold">Font:</span>
							{#each Object.keys(styles["fonts"]) as style, i (i)}
								<button
									class={[
										"underline-offset-4 hover:underline hover:decoration-foreground",
										{
											"text-primary underline decoration-primary":
												style === focusedTextArea?.settings.fontFamily
										}
									]}
									onclick={() => {
										if (!focusedTextArea) return;
										focusedTextArea.settings.fontFamily = style as TextAreaSettings["fontFamily"];
										updateTextAreaStyle(focusedTextArea);
										focusedTextArea.element.focus();
									}}
								>
									{style}
								</button>
							{/each}
						</div>
						<div class="flex items-center gap-4">
							<span class="font-semibold">Text color:</span>
							{#each styles["colors"] as color (color)}
								<button
									aria-label="Text color"
									class={[
										"h-8 w-8 rounded-full hover:ring-4 hover:ring-foreground",
										{
											"ring-4 ring-primary": color === focusedTextArea?.settings.textColor
										}
									]}
									style="background-color: {color};"
									onclick={() => {
										if (!focusedTextArea) return;
										focusedTextArea.settings.textColor = color;
										updateTextAreaStyle(focusedTextArea);
										focusedTextArea.element.focus();
									}}
								></button>
							{/each}
						</div>
						<div class="flex items-center gap-4">
							<span class="font-semibold">Font size:</span>
							{#each Object.keys(styles["fontSizes"]) as size (size)}
								<button
									class={[
										"underline-offset-4 hover:underline hover:decoration-foreground",
										{
											"text-primary underline decoration-primary":
												size === focusedTextArea?.settings.fontSize
										}
									]}
									onclick={() => {
										if (!focusedTextArea) return;
										focusedTextArea.settings.fontSize = size as TextAreaSettings["fontSize"];
										updateTextAreaStyle(focusedTextArea);
										focusedTextArea.element.focus();
									}}
								>
									{size}
								</button>
							{/each}
						</div>
					</div>
				</section>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
