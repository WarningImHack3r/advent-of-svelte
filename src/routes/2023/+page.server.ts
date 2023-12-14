import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
	const [kids, presents] = await Promise.all([
		fetch("https://advent.sveltesociety.dev/data/2023/day-one.json").then(res => res.json()),
		fetch("https://advent.sveltesociety.dev/data/2023/day-three.json").then(res => res.json())
	]);
	return {
		streamed: {
			kids: kids as { name: string; tally: number }[],
			presents: presents as { name: string; weight: number }[]
		}
	};
};
