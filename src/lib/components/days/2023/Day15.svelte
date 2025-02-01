<script lang="ts">
	import { type Snippet } from "svelte";

	type Props = {
		children?: Snippet;
		[key: string]: unknown;
	};

	let { ...props }: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="160 110 170 220"
	width="200"
	height="230"
	{...props}
>
	<ellipse
		style="stroke: currentColor; fill: none; stroke-width: 5px;"
		cx="250"
		cy="200"
		rx="85"
		ry="85"
	/>
	<foreignObject x="163" y="112.5" width="174.5" height="175">
		{@render props.children?.()}
	</foreignObject>
	<rect
		x="180"
		y="265"
		width="140"
		height="20"
		style="stroke: currentColor; stroke-width: 5px; stroke-linejoin: round;"
	/>
	<rect
		x="170"
		y="285"
		width="160"
		height="35"
		style="stroke: currentColor; stroke-width: 5px; stroke-linejoin: round;"
	/>
</svg>
