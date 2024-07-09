type NameObject = { name: string };
type Kid = NameObject & { tally: number };
type Present = NameObject & { weight: number };

export async function load({ fetch }) {
	return {
		kids: fetch("https://advent.sveltesociety.dev/data/2023/day-one.json").then(res =>
			res.json()
		) as Promise<Kid[]>,
		presents: fetch("https://advent.sveltesociety.dev/data/2023/day-three.json").then(res =>
			res.json()
		) as Promise<Present[]>,
		presents_v2: fetch("https://advent.sveltesociety.dev/data/2023/day-thirteen.json").then(res =>
			res.json()
		) as Promise<Present[]>
	};
}
