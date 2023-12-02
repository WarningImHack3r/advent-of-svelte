import type { LayoutServerLoad } from "./$types";

/**
 * Scans the given directory for subroutes. Does not include dynamic routes.
 * @param path the path to scan routes from
 * @returns an array of routes
 */
function getRoutes() {
	const files = Object.keys(import.meta.glob("/src/routes/**/*")).filter(
		file => !file.includes("[") && !file.includes("(")
	);
	return [
		...new Set(
			files
				.map(file => file.split("/").slice(0, -1).join("/").replace("/src/routes", ""))
				.filter(Boolean)
				.map(route => route.replace(/^\//, ""))
		)
	];
}

export const load: LayoutServerLoad = () => {
	return {
		years: getRoutes()
	};
};
