import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ parent }) => {
	const { years } = await parent();
	redirect(302, years[years.length - 1] ?? "/");
};
