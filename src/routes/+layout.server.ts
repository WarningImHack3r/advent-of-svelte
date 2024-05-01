type Route = {
	year: string;
	components: number;
};

/**
 * Scans the given directory for subroutes. Does not include dynamic routes.
 *
 * @returns an array of {@link Route} objects
 */
function getRoutes(): Route[] {
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
	].map(year => ({
		year,
		components: Object.keys(import.meta.glob("$lib/components/days/**/*")).filter(component => {
			const yearDir = component.split("/").at(-2);
			return yearDir ? yearDir === year : component.includes(year);
		}).length
	}));
}

export function load() {
	return {
		years: getRoutes()
	};
}
