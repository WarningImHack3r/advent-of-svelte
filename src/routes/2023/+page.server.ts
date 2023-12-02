import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		streamed: {
			kids: fetch("https://advent.sveltesociety.dev/data/2023/day-one.json").then(res =>
				res.json()
			) as Promise<{ name: string; tally: number }[]>
		}
	};
};
