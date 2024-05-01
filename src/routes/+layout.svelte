<script lang="ts">
	import "../app.pcss";
	import { onMount, type SvelteComponent } from "svelte";
	import type { SvelteHTMLElements } from "svelte/elements";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
	import ChevronDown from "lucide-svelte/icons/chevron-down";
	import Hammer from "lucide-svelte/icons/hammer";
	import Moon from "lucide-svelte/icons/moon";
	import Monitor from "lucide-svelte/icons/monitor";
	import Settings2 from "lucide-svelte/icons/settings-2";
	import Sun from "lucide-svelte/icons/sun";
	import { toast } from "svelte-sonner";
	import { ModeWatcher, resetMode, setMode } from "mode-watcher";
	import { cn } from "$lib/utils";
	import Santa from "$lib/components/Santa.svelte";
	import Snowflakes, { maxParticles, speed } from "$lib/components/Snowflakes.svelte";
	import { Button, buttonVariants } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Toaster } from "$lib/components/ui/sonner";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Tooltip from "$lib/components/ui/tooltip";

	export let data;

	// Year selector
	let selectedYear = "Choose a year";
	const maxComponents = 24;
	$: if ($page.route.id) {
		const currentPage = $page.route.id.split("/")[1];
		if (currentPage && data.years.map(route => route.year).includes(currentPage)) {
			selectedYear = currentPage;
		}
	}
	let yearSwitcherOpen = false;

	// Settings
	let settingsOpen = false;
	let isMaxParticlesValid = true;
	let unsavedMaxParticles = $maxParticles;
	let isSpeedValid = true;
	let unsavedSpeed = $speed;

	// Theme selector
	type Theme = {
		value: typeof theme;
		label: string;
		icon: typeof SvelteComponent<SvelteHTMLElements["svg"]>;
	};
	const themes: Theme[] = [
		{
			value: "light",
			label: "Light",
			icon: Sun
		},
		{
			value: "dark",
			label: "Dark",
			icon: Moon
		},
		{
			value: "system",
			label: "System",
			icon: Monitor
		}
	];
	let theme: "light" | "dark" | "system";
	let themeSwitcherOpen = false;

	onMount(() => {
		if ("mode-watcher-mode" in localStorage) {
			theme = localStorage["mode-watcher-mode"].replace(/"/g, "");
		} else {
			theme = "system";
		}

		const date = new Date();
		if (date.getMonth() === 11) {
			toast("Merry Christmas!", {
				description: `Happy holidays and a happy new year ${date.getFullYear() + 1}!`,
				duration: 10000,
				icon: Santa
			});
		}
	});
</script>

<svelte:head>
	<title>Advent of Svelte {$page.route.id?.split("/")[1]} | WarningImHack3r</title>
</svelte:head>

<Snowflakes />
<ModeWatcher />
<Toaster closeButton />
<header
	class="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="mx-auto flex h-14 w-full items-center px-8">
		<!-- Left part -->
		<a href="/" class="flex items-center gap-2">
			<img src="https://advent.sveltesociety.dev/favicon.png" alt="Advent of Svelte" class="h-8" />
			<div class="hidden xs:block">
				<h2 class="font-semibold xs:text-xl">Advent of Svelte</h2>
				<h3 class="text-xs text-muted-foreground">by WarningImHack3r</h3>
			</div>
		</a>
		<div class="xs:ml-4">
			<DropdownMenu.Root bind:open={yearSwitcherOpen}>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="ghost" class="gap-1 text-muted-foreground">
						{#if (data.years.find(year => year.year === selectedYear)?.components ?? maxComponents) < maxComponents}
							<Tooltip.Root>
								<Tooltip.Trigger>
									<Hammer class="mr-1 size-4" />
								</Tooltip.Trigger>
								<Tooltip.Content>Work in progress!</Tooltip.Content>
							</Tooltip.Root>
						{/if}
						{selectedYear}
						<ChevronDown
							class={"size-4 transition-transform" + (yearSwitcherOpen ? " rotate-180" : "")}
						/>
						<span class="sr-only">Go to another year</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.RadioGroup bind:value={selectedYear}>
						{#each data.years as { year, components }}
							<DropdownMenu.RadioItem
								class={"flex cursor-pointer flex-col items-start [&>*:first-child]:top-2 [&>*:not(:nth-child(2))]:z-10" +
									(components > 0 && components < maxComponents
										? " transition-colors duration-300"
										: "")}
								value={year}
								on:click={() => goto(`/${year}`)}
							>
								<div
									class={"absolute inset-0 rounded-sm" +
										(components > 0 && components < maxComponents ? " bg-accent/75" : "")}
									style="width: {(components / maxComponents) * 100}%"
								></div>
								<span>{year}</span>
								<span class="text-muted-foreground">
									{#if components === maxComponents}
										Completed!
									{:else if components === 0}
										Not started
									{:else}
										Progress: {components} / {maxComponents}
									{/if}
								</span>
							</DropdownMenu.RadioItem>
						{/each}
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>

		<!-- Right part -->
		<div class="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
			<nav class="flex items-center space-x-1">
				<Button
					href="https://github.com/WarningImHack3r/advent-of-code"
					target="_blank"
					rel="noreferrer"
					variant="ghost"
					class="group mr-6 text-muted-foreground max-md:hidden"
				>
					My Advent of Code
					<ArrowUpRight
						class="ml-2 size-4 transition-transform duration-300 group-hover:text-primary group-hover:-translate-y-1 group-hover:translate-x-1"
					/>
				</Button>
				<Dialog.Root bind:open={settingsOpen}>
					<Dialog.Trigger class={cn(buttonVariants({ variant: "ghost" }), "aspect-square p-0")}>
						<Settings2 class="size-5" />
						<span class="sr-only">Settings</span>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Settings</Dialog.Title>
							<Dialog.Description>Tweak the website to your liking.</Dialog.Description>
						</Dialog.Header>
						<!-- Snowflakes quantity and speed -->
						<h3 class="border-b pb-1">Snowflakes background</h3>
						<div class="grid w-full max-w-sm items-center gap-1.5">
							<Label for="quantity">
								Quantity
								<span class="text-sm text-muted-foreground">(default: 100)</span>
							</Label>
							<Input
								type="number"
								id="quantity"
								min="10"
								max="1000"
								bind:value={unsavedMaxParticles}
								on:input={e => {
									isMaxParticlesValid = e.target?.checkValidity() ?? false;
								}}
								placeholder="Snowflakes quantity"
							/>
						</div>
						<div class="grid w-full max-w-sm items-center gap-1.5">
							<Label for="speed">
								Speed
								<span class="text-sm text-muted-foreground">(default: 1000)</span>
							</Label>
							<Input
								type="number"
								id="speed"
								min="250"
								max="5000"
								bind:value={unsavedSpeed}
								on:input={e => {
									isSpeedValid = e.target?.checkValidity() ?? false;
								}}
								placeholder="Snowflakes speed"
							/>
						</div>
						<Dialog.Footer class="mt-4">
							<Button variant="secondary" on:click={() => (settingsOpen = false)}>Cancel</Button>
							<Button
								type="submit"
								disabled={!isMaxParticlesValid || !isSpeedValid}
								on:click={() => {
									settingsOpen = false;
									$maxParticles = unsavedMaxParticles;
									$speed = unsavedSpeed;
								}}
							>
								Save changes
							</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
				<Button
					href="https://github.com/WarningImHack3r/advent-of-svelte"
					target="_blank"
					rel="noreferrer"
					variant="ghost"
					class="aspect-square p-0"
				>
					<img src="/github.svg" alt="GitHub" class="size-5 dark:invert" />
					<span class="sr-only">GitHub</span>
				</Button>
				<DropdownMenu.Root bind:open={themeSwitcherOpen}>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="icon" class="w-14 gap-1">
							<div class="flex items-center">
								<Sun
									class="size-5 transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0"
								/>
								<Moon
									class="absolute size-5 transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100"
								/>
							</div>
							<ChevronDown
								class={"size-4 opacity-50 transition-transform" +
									(themeSwitcherOpen ? " rotate-180" : "")}
							/>
							<span class="sr-only">Change theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Label>Theme</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.RadioGroup bind:value={theme}>
							{#each themes as availableTheme}
								<DropdownMenu.RadioItem
									class="cursor-pointer data-[disabled]:opacity-100"
									value={availableTheme.value}
									disabled={theme === availableTheme.value}
									on:click={() => {
										return availableTheme.value === "system"
											? resetMode()
											: setMode(availableTheme.value);
									}}
								>
									<svelte:component this={availableTheme.icon} class="mr-2 size-4" />
									<span>{availableTheme.label}</span>
								</DropdownMenu.RadioItem>
							{/each}
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</nav>
		</div>
	</div>
</header>

<slot />

<footer class="mt-auto w-full border-t bg-background py-4 xs:py-0">
	<div class="mx-auto flex h-12 w-full items-center px-8">
		<p class="text-sm text-muted-foreground">
			Built by <a
				href="https://github.com/WarningImHack3r"
				target="_blank"
				class={cn(
					buttonVariants({
						variant: "link"
					}),
					"h-auto p-0"
				)}
			>
				WarningImHack3r
			</a>.
			<a
				href="https://advent.sveltesociety.dev"
				target="_blank"
				class={cn(
					buttonVariants({
						variant: "link"
					}),
					"h-auto p-0 italic"
				)}
			>
				Advent of Svelte
			</a>
			challenges by the
			<a
				href="https://sveltesociety.dev"
				target="_blank"
				class={cn(
					buttonVariants({
						variant: "link"
					}),
					"h-auto p-0 text-orange-500"
				)}
			>
				Svelte Society
			</a> team.
		</p>
	</div>
</footer>
