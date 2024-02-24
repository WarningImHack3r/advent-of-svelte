import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		streamed: {
			kids: fetch("https://advent.sveltesociety.dev/data/2023/day-one.json").then(res =>
				res.json()
			) as Promise<{ name: string; tally: number }[]>,
			presents: fetch("https://advent.sveltesociety.dev/data/2023/day-three.json").then(res =>
				res.json()
			) as Promise<{ name: string; weight: number }[]>,
			presents_v2: fetch("https://advent.sveltesociety.dev/data/2023/day-thirteen.json").then(res =>
				res.json()
			) as Promise<{ name: string; weight: number }[]>
		}
	};
};
