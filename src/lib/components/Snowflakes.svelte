<script lang="ts">
import { onDestroy, onMount, tick } from "svelte";

let width: number;
let height: number;
let snowflakes: HTMLCanvasElement;
let particles: {
	x: number;
	y: number;
	radius: number;
	density: number;
}[] = [];
let frame: ReturnType<typeof requestAnimationFrame>;
let timeout: ReturnType<typeof setTimeout>;

function resize() {
	if (!snowflakes) return;

	width = window.innerWidth;
	height = window.innerHeight;

	snowflakes.width = width;
	snowflakes.height = height;
}

function debounceResize() {
	clearTimeout(timeout);
	cancelAnimationFrame(frame);
	timeout = setTimeout(startSnow, 100);
}

function regenerateParticles() {
	const maxParticles = 100;

	const newParticles: typeof particles = [];
	for (let i = 0; i < maxParticles; i++) {
		newParticles.push({
			x: Math.random() * width,
			y: Math.random() * height,
			radius: 1 + Math.random() * 2,
			density: Math.random() * maxParticles
		});
	}
	return newParticles;
}

function startSnow() {
	resize();

	particles = regenerateParticles();

	const ctx = snowflakes.getContext("2d")!;

	// Draw the flakes
	function draw() {
		ctx.clearRect(0, 0, width, height);

		for (let particle of particles) {
			ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, true);
			ctx.fill();
		}
		update();
	}

	// Move the snowflakes
	let angle = 0;
	let margin = 50;
	const speed = 3000;
	function update(time = Date.now()) {
		angle = time / speed;
		for (let [i, particle] of particles.entries()) {
			// Updating X and Y coordinates
			particle.y += 1 + Math.cos(angle + particle.density) + particle.radius / 2;
			particle.x += Math.sin(angle) * 2;

			// Sending flakes back from the top when it exits
			if (particle.x > width + margin || particle.x < -margin || particle.y > height) {
				if (i % 3 > 0) {
					// 2/3 of the flakes
					particles[i] = {
						x: Math.random() * width,
						y: -10,
						radius: particle.radius,
						density: particle.density
					};
				} else {
					// If the flake is exiting from the right
					if (Math.sin(angle) > 0) {
						// Enter from the left
						particles[i] = {
							x: -margin,
							y: Math.random() * height,
							radius: particle.radius,
							density: particle.density
						};
					} else {
						// Enter from the right
						particles[i] = {
							x: width + margin,
							y: Math.random() * height,
							radius: particle.radius,
							density: particle.density
						};
					}
				}
			}
		}
		frame = requestAnimationFrame(() => {
			timeout = setTimeout(draw, 1000 / 60);
		});
	}

	// Animation loop
	draw();
}

onMount(async () => {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	await tick();

	startSnow();
});

onDestroy(() => {
	clearTimeout(timeout);
});
</script>

<svelte:window on:resize={debounceResize} />

<canvas
	aria-hidden="true"
	bind:this={snowflakes}
	width={width}
	height={height}
	class="pointer-events-none fixed inset-0 -z-10 h-screen w-screen"
></canvas>
