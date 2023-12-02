import type { LayoutServerLoad } from "./$types";
import * as fs from "fs";

/**
 * Scans the given directory for subroutes. Does not include dynamic routes.
 * @param path the path to scan routes from
 * @returns an array of routes
 */
function getRoutes(path: string) {
	const files = fs.readdirSync(path).filter(file => !file.includes("[") && !file.includes("(")); // Filter out dynamic routes
	const routes: string[] = [];
	for (const file of files) {
		const filePath = `${path}/${file}`;
		if (fs.statSync(filePath).isDirectory()) {
			routes.push(...getRoutes(filePath));
		} else if (file === "+page.svelte") {
			routes.push(filePath.split("/").at(-2) ?? "");
		}
	}
	return routes;
}

export const load: LayoutServerLoad = () => {
	return {
		years: getRoutes("src/routes")
	};
};
