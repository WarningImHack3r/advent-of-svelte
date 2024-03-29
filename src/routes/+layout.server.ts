import type { LayoutServerLoad } from "./$types";

/**
 * Scans the given directory for subroutes. Does not include dynamic routes.
 * @returns an array of routes
 */
function getRoutes() {
	const files = Object.keys(import.meta.glob("/src/routes/**/*")).filter(
		file => !file.includes("[") && !file.includes("(")
	);
	return [
		...new Set(
			files
				.map(file => file.split("/").slice(3, -1))
				.filter(Boolean)
				.filter(route => route.length === 1)
				.flat()
		)
	];
}

export const load: LayoutServerLoad = () => {
	return {
		years: getRoutes()
	};
};
