"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TableInstance,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { AlertCircleIcon, ChevronDownIcon, ChevronsUpDownIcon, EyeIcon, InboxIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { nextFilterValue } from "./data-table-filter";

export type DataTableFilterOption = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type DataTableFilter = {
  columnId: string;
  title: string;
  options: DataTableFilterOption[];
  multiple?: boolean;
};

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  pageSizeOptions?: number[];
  initialPageSize?: number;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  getRowId?: (row: TData, index: number, parent?: Row<TData>) => string;
  isLoading?: boolean;
  loadingRows?: number;
  error?: string | null;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  onRowClick?: (row: TData) => void;
  toolbar?: React.ReactNode | ((table: TableInstance<TData>) => React.ReactNode);
  footer?: React.ReactNode | ((table: TableInstance<TData>) => React.ReactNode);
  className?: string;
  enablePagination?: boolean;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Cari…",
  filters = [],
  pageSizeOptions = [10, 20, 30, 40, 50],
  initialPageSize = 10,
  enableRowSelection = false,
  getRowId,
  isLoading = false,
  loadingRows = 5,
  error,
  emptyMessage = "Tiada rekod.",
  onRetry,
  onRowClick,
  emptyAction,
  toolbar,
  footer,
  className,
  enablePagination = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // TanStack owns the table instance and its mutable feature state.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
    enableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  const customToolbar = typeof toolbar === "function" ? toolbar(table) : toolbar;

  return (
    <div className={cn("grid min-w-0 gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {searchKey ? (
            <div className="relative min-w-56 flex-1 sm:max-w-sm">
              <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn(searchKey)?.setFilterValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-8"
              />
            </div>
          ) : null}
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId);
            return column ? (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                multiple={filter.multiple ?? true}
              />
            ) : null;
          })}
          {columnFilters.length > 0 || sorting.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                table.resetSorting();
              }}
            >
              Reset
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {customToolbar}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            {error}
            {onRetry ? <Button variant="outline" size="sm" onClick={onRetry}>Cuba lagi</Button> : null}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <DataTableLoading columns={columns.length} rows={loadingRows} />
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      className={cn(onRowClick && "cursor-pointer")}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="p-2">
                      <Empty className="min-h-32 border-0">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <InboxIcon />
                          </EmptyMedia>
                          <EmptyTitle>{emptyMessage}</EmptyTitle>
                        </EmptyHeader>
                        {emptyAction ? <div className="mt-3">{emptyAction}</div> : null}
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {footer ? <div>{typeof footer === "function" ? footer(table) : footer}</div> : null}
          {enablePagination ? <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} /> : null}
        </>
      )}
    </div>
  );
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "desc" ? <ChevronDownIcon className="ml-2 size-4" /> : <ChevronsUpDownIcon className="ml-2 size-4" />}
    </Button>
  );
}

export function DataTableSelectColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Pilih baris"
        onClick={(event) => event.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  multiple,
}: {
  column: import("@tanstack/react-table").Column<TData, TValue>;
  title: string;
  options: DataTableFilterOption[];
  multiple: boolean;
}) {
  const filterValue = column.getFilterValue();
  const selected = new Set(
    Array.isArray(filterValue)
      ? (filterValue as string[])
      : typeof filterValue === "string" && filterValue
        ? [filterValue]
        : [],
  );
  const optionValues = options.map((option) => option.value);

  return (
    <Combobox
      items={optionValues}
      multiple={multiple}
      value={multiple ? Array.from(selected) : Array.from(selected)[0] ?? null}
      onValueChange={(value) => {
        if (multiple) {
          const next = Array.isArray(value) ? value : value ? [value] : [];
          column.setFilterValue(next.length ? next : undefined);
          return;
        }

        column.setFilterValue(
          typeof value === "string"
            ? nextFilterValue([], value, true, false)
            : undefined,
        );
      }}
    >
      <ComboboxInput
        placeholder={selected.size ? `${title} · ${selected.size}` : title}
        showTrigger
        showClear={selected.size > 0}
        className="h-9 w-52"
        aria-label={title}
      />
      <ComboboxContent>
        <ComboboxEmpty>Tiada pilihan ditemui.</ComboboxEmpty>
        <ComboboxList>
          {(value) => {
            const option = options.find((item) => item.value === value);
            if (!option) return null;
            return (
              <ComboboxItem key={option.value} value={option.value}>
                {option.icon ? <option.icon className="text-muted-foreground" /> : null}
                {option.label}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

function DataTableViewOptions<TData>({ table }: { table: TableInstance<TData> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <EyeIcon className="size-4" />
          <span className="hidden sm:inline">Paparan</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Lajur</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {typeof column.columnDef.header === "string" ? column.columnDef.header : column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DataTableLoading({ columns, rows }: { columns: number; rows: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <TableRow key={row}>
      {Array.from({ length: columns }, (_, column) => (
        <TableCell key={column}><Skeleton className="h-4 w-full max-w-40" /></TableCell>
      ))}
    </TableRow>
  ));
}
