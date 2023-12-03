<script lang="ts">
import { onMount } from "svelte";

let innerWidth: number;
let innerHeight: number;
let snowflakes: HTMLCanvasElement;
let timeout: ReturnType<typeof setTimeout>;

onMount(() => {
	const ctx = snowflakes.getContext("2d")!;

	// Canvas size
	const WIDTH = innerWidth;
	const HEIGHT = innerHeight;
	snowflakes.width = WIDTH;
	snowflakes.height = HEIGHT;

	// Create the particles
	const maxParticles = 100;
	const particles: { x: number; y: number; radius: number; density: number }[] = [];
	for (let i = 0; i < maxParticles; i++) {
		particles.push({
			x: Math.random() * WIDTH,
			y: Math.random() * HEIGHT,
			radius: 1 + Math.random() * 2,
			density: Math.random() * maxParticles
		});
	}

	// Draw the flakes
	function draw() {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

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
	let n = 5;
	function update(d = Date.now()) {
		angle = d / 3e3;
		for (let [i, particle] of particles.entries()) {
			// Updating X and Y coordinates
			particle.y += 1 + Math.cos(angle + particle.density) + particle.radius / 2;
			particle.x += Math.sin(angle) * 2;

			// Sending flakes back from the top when it exits
			if (particle.x > WIDTH + n || particle.x < -n || particle.y > HEIGHT) {
				if (i % 3 > 0) {
					// 2/3 of the flakes
					particles[i] = {
						x: Math.random() * WIDTH,
						y: -10,
						radius: particle.radius,
						density: particle.density
					};
				} else {
					// If the flake is exiting from the right
					if (Math.sin(angle) > 0) {
						// Enter from the left
						particles[i] = {
							x: -n,
							y: Math.random() * HEIGHT,
							radius: particle.radius,
							density: particle.density
						};
					} else {
						// Enter from the right
						particles[i] = {
							x: WIDTH + n,
							y: Math.random() * HEIGHT,
							radius: particle.radius,
							density: particle.density
						};
					}
				}
			}
		}
		requestAnimationFrame(() => {
			timeout = setTimeout(draw, 1e3 / 60);
		});
	}

	// Animation loop
	draw();

	return () => {
		clearTimeout(timeout);
	};
});
</script>

<svelte:window bind:innerWidth={innerWidth} bind:innerHeight={innerHeight} />

<canvas
	aria-hidden="true"
	bind:this={snowflakes}
	width={innerWidth}
	height={innerHeight}
	class="pointer-events-none fixed inset-0 !-z-10 h-screen w-screen"
></canvas>
