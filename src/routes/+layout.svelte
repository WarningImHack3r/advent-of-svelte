<script lang="ts">
import "../app.pcss";
import type { LayoutData } from "./$types";
import { onMount } from "svelte";
import { goto } from "$app/navigation";
import { page } from "$app/stores";
import { ChevronDown, Github, Moon, Monitor, Sun } from "lucide-svelte";
import { ModeWatcher, resetMode, setMode } from "mode-watcher";
import { cn } from "$lib/utils";
import Snowflakes from "$lib/components/Snowflakes.svelte";
import { Button, buttonVariants } from "$lib/components/ui/button";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

export let data: LayoutData;

// Year selector
let selectedYear = "Choose a year";
$: if ($page.route.id) {
	const currentPage = $page.route.id.split("/")[1];
	if (currentPage && data.years.includes(currentPage)) {
		selectedYear = currentPage;
	}
}
let yearSwitcherOpen = false;

// Theme selector
let theme: "light" | "dark" | "system";
let themeSwitcherOpen = false;

onMount(() => {
	if ("userPrefersMode" in localStorage) {
		theme = localStorage.userPrefersMode.replace(/"/g, "");
	} else {
		theme = "system";
	}
});
</script>

<svelte:head>
	<title>Advent of Svelte {$page.route.id?.replace("/", "")} | WarningImHack3r</title>
</svelte:head>

<Snowflakes />
<ModeWatcher />
<header
	class="sticky top-0 z-40 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-14 items-center">
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
					<Button builders={[builder]} variant="ghost" class="gap-1">
						<span class="text-muted-foreground">
							{selectedYear}
						</span>
						<ChevronDown
							class={"h-4 w-4 opacity-50 transition-transform" +
									(yearSwitcherOpen ? " rotate-180" : "")}
						/>
						<span class="sr-only">Go to another year</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="start">
					<DropdownMenu.RadioGroup bind:value={selectedYear}>
						{#each data.years as year}
							<DropdownMenu.RadioItem
								class="cursor-pointer"
								value={year}
								on:click={() => goto(`/${year}`)}
							>
								{year}
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
					href="https://github.com/WarningImHack3r/advent-of-svelte"
					target="_blank"
					rel="noreferrer"
					variant="ghost"
					class="aspect-square p-0"
				>
					<Github class="h-5 w-5" />
					<span class="sr-only">GitHub</span>
				</Button>
				<DropdownMenu.Root bind:open={themeSwitcherOpen}>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" size="icon" class="w-14 gap-1">
							<div class="flex items-center">
								<Sun
									class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
								/>
								<Moon
									class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
								/>
							</div>
							<ChevronDown
								class={"h-4 w-4 opacity-50 transition-transform" +
									(themeSwitcherOpen ? " rotate-180" : "")}
							/>
							<span class="sr-only">Change theme</span>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Label>Theme</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.RadioGroup bind:value={theme}>
							<DropdownMenu.RadioItem
								class="cursor-pointer"
								value="light"
								on:click={() => setMode("light")}
							>
								<Sun class="mr-2 h-4 w-4" />
								<span>Light</span>
							</DropdownMenu.RadioItem>
							<DropdownMenu.RadioItem
								class="cursor-pointer"
								value="dark"
								on:click={() => setMode("dark")}
							>
								<Moon class="mr-2 h-4 w-4" />
								<span>Dark</span>
							</DropdownMenu.RadioItem>
							<DropdownMenu.RadioItem
								class="cursor-pointer"
								value="system"
								on:click={() => resetMode()}
							>
								<Monitor class="mr-2 h-4 w-4" />
								<span>System</span>
							</DropdownMenu.RadioItem>
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</nav>
		</div>
	</div>
</header>

<div class="flex-1">
	<slot />
</div>

<footer class="w-full border-t bg-background py-4 xs:py-0">
	<div class="container flex h-12 items-center">
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
