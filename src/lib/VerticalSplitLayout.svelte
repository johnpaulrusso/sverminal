<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	export let splitActive: boolean = false;

	let containerDiv: HTMLDivElement | null = null;
	let topDiv: HTMLDivElement | null = null;
	let bottomDiv: HTMLDivElement | null = null;
	let divider: HTMLButtonElement | null = null;
	let isResizing: boolean = false;
	let resizeObserver: ResizeObserver | null = null;

	const MIN_SECTION_HEIGHT_PX = 50;

	$: if (!splitActive) {
		if (topDiv && bottomDiv) {
			topDiv.style.height = '';
			bottomDiv.style.height = '';
		}
	}

	function onMouseDown(e: MouseEvent) {
		isResizing = true;
	}

	function onMouseMove(e: MouseEvent) {
		if (!isResizing || !topDiv || !bottomDiv || !divider || !containerDiv) return;

		const containerRect = containerDiv.getBoundingClientRect();
		const topDivHeight = e.clientY - containerRect.top;

		// Ensure the height doesn't cause the bottom div to disappear
		if (topDivHeight > containerRect.height - MIN_SECTION_HEIGHT_PX) return;
		if (topDivHeight < MIN_SECTION_HEIGHT_PX) return;

		// Set the new heights for the divs
		topDiv.style.height = `${topDivHeight}px`;
		bottomDiv.style.height = `${containerRect.height - topDivHeight}px`;
		divider.style.bottom = `${containerRect.height - topDivHeight}px`;
	}

	function onMouseUp(e: MouseEvent) {
		isResizing = false;
	}

	function onResize(e: Event) {
		performResize();
	}

	function performResize() {
		if (!divider || !topDiv || !bottomDiv || !containerDiv) return;

		const containerRect = containerDiv.getBoundingClientRect();
		const topRect = topDiv.getBoundingClientRect();
		const bottomRect = bottomDiv.getBoundingClientRect();

		//Shrink the bottom first.
		if (bottomRect.height <= MIN_SECTION_HEIGHT_PX) {
			topDiv.style.height = `${containerRect.height - MIN_SECTION_HEIGHT_PX}px`;
			divider.style.bottom = `${MIN_SECTION_HEIGHT_PX}px`;
			bottomDiv.style.height = `${MIN_SECTION_HEIGHT_PX}px`;
		} else if (topRect.height <= MIN_SECTION_HEIGHT_PX) {
			return; //Can't get any smaller.
		} else {
			let updatedBottomHeight = containerRect.height - topRect.height;
			divider.style.bottom = `${updatedBottomHeight}px`;
			bottomDiv.style.height = `${updatedBottomHeight}px`;
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
			window.addEventListener('resize', onResize);

			resizeObserver = new ResizeObserver(() => {
				performResize();
			});

			if (containerDiv) {
				resizeObserver.observe(containerDiv);
			}
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
			window.removeEventListener('resize', onResize);
		}
	});
</script>

<div
	bind:this={containerDiv}
	class="relative w-full h-full min-h-[{2 * MIN_SECTION_HEIGHT_PX}px] text-slate-50"
>
	<div
		bind:this={topDiv}
		class="relative {splitActive ? 'h-[50%]' : 'h-0'} w-full min-h-[{splitActive
			? MIN_SECTION_HEIGHT_PX
			: 0}px] left-0 z-0 overflow-x-auto top-0 bg-slate-900 {splitActive
			? 'border-b-[1px]'
			: ''} border-slate-700"
	>
		<slot name="top" />
	</div>
	{#if splitActive}
		<button
			bind:this={divider}
			class="absolute h-[5px] w-full left-0 bottom-[50%] z-10 cursor-row-resize op
        hover:bg-cyan-800 hover:duration-200 hover:delay-200 hover:opacity-90
        {isResizing ? 'bg-cyan-800 opacity-90' : 'bg-slate-700 opacity-0'}"
			on:mousedown={onMouseDown}
		>
		</button>
	{/if}
	<div
		bind:this={bottomDiv}
		class="relative w-full {splitActive
			? 'h-[50%]'
			: 'h-full'} min-h-[{MIN_SECTION_HEIGHT_PX}px] left-0 z-0 overflow-x-auto bottom-0 bg-slate-900"
	>
		<slot name="bottom" />
	</div>
</div>
