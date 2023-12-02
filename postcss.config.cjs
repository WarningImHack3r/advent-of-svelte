const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcssImport = require("postcss-import");

module.exports = {
	plugins: [
		postcssImport(),
		// Some plugins, like tailwindcss/nesting, need to run before Tailwind,
		tailwindcss(),
		//Some plugins, like tailwindcss/nesting, need to run before Tailwind,
		tailwindcss(),
		//But others, like autoprefixer, need to run after,
		// But others, like autoprefixer, need to run after,
		autoprefixer
	]
};
