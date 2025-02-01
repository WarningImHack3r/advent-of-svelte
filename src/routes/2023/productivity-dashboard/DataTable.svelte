<script lang="ts">
	import { createRawSnippet } from "svelte";
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from "@tanstack/table-core";
	import {
		ArrowDownAZ,
		ArrowUpDown,
		ArrowDownZA,
		ChevronDown,
		ChevronLeft,
		ChevronRight
	} from "lucide-svelte";
	import type { Task } from "$lib/components/days/2023/Day5.svelte";
	import { Button } from "$lib/components/ui/button";
	import { createSvelteTable, FlexRender, renderSnippet } from "$lib/components/ui/data-table";
	import { Input } from "$lib/components/ui/input";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Pagination from "$lib/components/ui/pagination";
	import * as Table from "$lib/components/ui/table";

	let { tableData }: { tableData: Task[] } = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});

	const columns: ColumnDef<Task>[] = [
		{
			accessorKey: "elf",
			header: ({ column }) =>
				renderSnippet(
					createRawSnippet(getName => ({
						render: () =>
							// column.toggleSorting(column.getIsSorted() === "asc")
							`<button type="button">${getName()} sortable!</button>`
					})),
					"Elf"
				)
		},
		{
			accessorKey: "task",
			header: "Task",
			cell: ({ row }) => {
				return renderSnippet(
					createRawSnippet(getAmount => ({
						render: () => `<div>${getAmount()}</div>`
					})),
					(() => {
						switch (row.getValue("task")) {
							case "CREATED_TOY":
								return "created a toy";
							case "WRAPPED_PRESENT":
								return "wrapped a present";
						}
					})()
				);
			}
		},
		{
			accessorKey: "minutesTaken",
			header: "Minutes Taken",
			cell: ({ row }) =>
				renderSnippet(
					createRawSnippet(getMinutes => ({
						render: () => `<div>${getMinutes()}</div>`
					})),
					`${row.getValue("minutesTaken")} minutes`
				)
		},
		{
			accessorKey: "date",
			header: "Date",
			cell: ({ row }) => {
				return renderSnippet(
					createRawSnippet(getValue => {
						const d = new Date(getValue());
						return {
							render: () => `${d.toLocaleDateString()} @ ${d.toLocaleTimeString()}`
						};
					}),
					"" + row.getValue("date")
				);
			}
		}
	];
	const table = createSvelteTable({
		get data() {
			return tableData;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			}
		},
		onPaginationChange: updater => {
			if (typeof updater === "function") {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: updater => {
			if (typeof updater === "function") {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: updater => {
			if (typeof updater === "function") {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: updater => {
			if (typeof updater === "function") {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel()
	});
</script>

<div>
	<div class="flex items-center py-4">
		<Input
			class="max-w-sm"
			placeholder="Filter elves..."
			value={(table.getColumn("elf")?.getFilterValue() as string) ?? ""}
			onchange={e => {
				table.getColumn("elf")?.setFilterValue(e.currentTarget.value);
			}}
			oninput={e => {
				table.getColumn("elf")?.setFilterValue(e.currentTarget.value);
			}}
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto">
						Columns <ChevronDown class="ml-2 size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter(col => col.getCanHide()) as column (column.id)}
					<DropdownMenu.CheckboxItem
						class="cursor-pointer capitalize"
						bind:checked={() => column.getIsVisible(), v => column.toggleVisibility(!!v)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && "selected"}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<div class="flex-1 text-sm text-muted-foreground">
			{#if table.getColumn("elf")?.getFilterValue()}
				<strong>{table.getPaginationRowModel().rows.length}</strong> out of
				<strong>{tableData.length}</strong> rows
			{:else}
				<strong>{table.getRowCount()}</strong> rows
			{/if}
		</div>
		<Pagination.Root
			class="mx-0 w-auto flex-row"
			count={tableData.length}
			perPage={pagination.pageSize}
		>
			{#snippet children({ pages, currentPage })}
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
							<Pagination.Item isVisible={currentPage === page.value}>
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
			{/snippet}
		</Pagination.Root>
	</div>
</div>
