<script lang="ts">
import type { PageData } from "./$types";
import Day1 from "$lib/components/days/2023/Day1.svelte";
import Day2 from "$lib/components/days/2023/Day2.svelte";
import Day3 from "$lib/components/days/2023/Day3.svelte";

export let data: PageData;
</script>

<div class="container pt-8">
	<h2 class="text-3xl font-bold tracking-tight">Santa's Dashboard</h2>
	<div
		class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4
		lg:[&>*:nth-child(1)]:col-span-2 lg:[&>*:nth-child(3)]:col-span-2"
	>
		<Day1 kids={data.streamed.kids} />
		<Day2 />
		<Day3 presents={data.streamed.presents} />
	</div>
</div>
