"use client";

import type { Table as TableInstance } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DataTablePagination<TData>({
  table,
  pageSizeOptions,
}: {
  table: TableInstance<TData>;
  pageSizeOptions: number[];
}) {
  const selected = table.getSelectedRowModel().rows.length;
  const total = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-1">
      <div className="text-sm text-muted-foreground">
        {selected > 0 ? `${selected} daripada ${total} dipilih` : `${total} rekod`}
      </div>
      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Baris setiap halaman</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => <SelectItem key={size} value={`${size}`}>{size}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-center text-sm font-medium">
          Halaman {pageCount === 0 ? 0 : table.getState().pagination.pageIndex + 1} daripada {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
            <ChevronsLeftIcon />
            <span className="sr-only">Halaman pertama</span>
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            <ChevronLeftIcon />
            <span className="sr-only">Halaman sebelumnya</span>
          </Button>
          <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            <ChevronRightIcon />
            <span className="sr-only">Halaman seterusnya</span>
          </Button>
          <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => table.setPageIndex(pageCount - 1)} disabled={!table.getCanNextPage()}>
            <ChevronsRightIcon />
            <span className="sr-only">Halaman terakhir</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
