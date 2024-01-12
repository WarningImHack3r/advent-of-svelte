<script lang="ts">
	import { readable } from "svelte/store";
	import { createTable, Render, Subscribe } from "svelte-headless-table";
	import {
		addHiddenColumns,
		addPagination,
		addSortBy,
		addTableFilter
	} from "svelte-headless-table/plugins";
	import {
		ArrowUpAZ,
		ArrowUpDown,
		ArrowUpZA,
		ChevronDown,
		ChevronLeft,
		ChevronRight
	} from "lucide-svelte";
	import type { Task } from "$lib/components/days/2023/Day5.svelte";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Table from "$lib/components/ui/table";

	export let tableData: Task[];

	const table = createTable(readable(tableData), {
		page: addPagination(),
		sort: addSortBy({
			initialSortKeys: [{ id: "date", order: "desc" }],
			disableMultiSort: true
		}),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		}),
		hide: addHiddenColumns()
	});
	const columns = table.createColumns([
		table.column({
			accessor: "elf",
			header: "Elf"
		}),
		table.column({
			accessor: "task",
			header: "Task",
			cell: ({ value }) => {
				switch (value) {
					case "CREATED_TOY":
						return "created a toy";
					case "WRAPPED_PRESENT":
						return "wrapped a present";
				}
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: "minutesTaken",
			header: "Minutes Taken",
			cell: ({ value }) => `${value} minutes`,
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			accessor: "date",
			header: "Date",
			cell: ({ value }) => {
				const d = new Date(value);
				return `${d.toLocaleDateString()} @ ${d.toLocaleTimeString()}`;
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		})
	]);
	const { flatColumns, headerRows, pageRows, pluginStates, rows, tableAttrs, tableBodyAttrs } =
		table.createViewModel(columns);
	const { pageIndex, pageSize } = pluginStates.page;
	const { filterValue } = pluginStates.filter;
	const { hiddenColumnIds } = pluginStates.hide;

	const hideForId = Object.fromEntries(flatColumns.map(col => [col.id, true]));
	$: $hiddenColumnIds = Object.entries(hideForId)
		.filter(([, hide]) => !hide)
		.map(([id]) => id);
	const hidableCols: (keyof (typeof tableData)[number])[] = ["task", "minutesTaken", "date"];
</script>

<div>
	<div class="flex items-center py-4">
		<Input class="max-w-sm" placeholder="Filter elves..." bind:value={$filterValue} />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild let:builder>
				<Button variant="outline" class="ml-auto" builders={[builder]}>
					Columns <ChevronDown class="ml-2 size-4" />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content>
				{#each flatColumns as col}
					{#if hidableCols.includes(col.id)}
						<DropdownMenu.CheckboxItem class="cursor-pointer" bind:checked={hideForId[col.id]}>
							{col.header}
						</DropdownMenu.CheckboxItem>
					{/if}
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										<Button variant="ghost" class="-ml-3 px-3" on:click={props.sort.toggle}>
											<Render of={cell.render()} />
											{#if props.sort.order === "asc"}
												<ArrowUpAZ class="ml-2 size-4 text-accent-foreground" />
											{:else if props.sort.order === "desc"}
												<ArrowUpZA class="ml-2 size-4 text-accent-foreground" />
											{:else}
												<ArrowUpDown class="ml-2 size-4" />
											{/if}
										</Button>
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										{#if cell.id === "elf"}
											<div class="font-semibold">
												<Render of={cell.render()} />
											</div>
										{:else if cell.id === "task"}
											<div class="text-muted-foreground">
												<Render of={cell.render()} />
											</div>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{#if $filterValue}
				<strong>{$rows.length}</strong> out of <strong>{tableData.length}</strong> rows
			{:else}
				<strong>{$rows.length}</strong> rows
			{/if}
		</div>
		<Pagination.Root
			class="mx-0 w-auto flex-row"
			count={$rows.length}
			page={$pageIndex + 1}
			perPage={$pageSize}
			onPageChange={page => ($pageIndex = page - 1)}
			let:pages
			let:currentPage
		>
			<Pagination.Content>
				<Pagination.Item>
					<Pagination.PrevButton>
						<ChevronLeft class="size-4" />
						<span class="hidden sm:block">Previous</span>
					</Pagination.PrevButton>
				</Pagination.Item>
				{#each pages as page (page.key)}
					{#if page.type === "ellipsis"}
						<Pagination.Item>
							<Pagination.Ellipsis />
						</Pagination.Item>
					{:else}
						<Pagination.Item>
							<Pagination.Link {page} isActive={currentPage === page.value}>
								{page.value}
							</Pagination.Link>
						</Pagination.Item>
					{/if}
				{/each}
				<Pagination.Item>
					<Pagination.NextButton>
						<span class="hidden sm:block">Next</span>
						<ChevronRight class="size-4" />
					</Pagination.NextButton>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	</div>
</div>
