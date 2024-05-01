import { redirect } from "@sveltejs/kit";

export async function load({ parent }) {
	const { years } = await parent();
	redirect(302, years.at(-1)?.year ?? "/");
}
