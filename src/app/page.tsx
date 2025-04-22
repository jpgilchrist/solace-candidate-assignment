"use client";

import { DataTable } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-header";
import { DataTablePagination } from "@/components/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogTitle } from "@radix-ui/react-dialog";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import { Advocate, AdvocateResponse } from "./common-types";

const columnHelper = createColumnHelper<Advocate>();
const defaultColumns = [
  columnHelper.accessor("firstName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
    cell: (info) => {
      return <span className="whitespace-nowrap">{info.getValue()}</span>;
    },
  }),
  columnHelper.accessor("lastName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
    cell: (info) => {
      return <span className="whitespace-nowrap">{info.getValue()}</span>;
    },
  }),
  columnHelper.accessor("city", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
    cell: (info) => {
      return <span className="whitespace-nowrap">{info.getValue()}</span>;
    },
  }),
  columnHelper.accessor("degree", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Degree" />
    ),
  }),
  columnHelper.accessor("specialties", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Specialties" />
    ),
    cell: (info) => {
      const specialties: string[] = info.getValue();
      return (
        <div className="flex flex-row flex-wrap gap-2">
          {specialties.slice(0, 3).map((specialty) => (
            <Badge key={`badge-${specialty}`} variant="secondary">
              {specialty}
            </Badge>
          ))}
          {specialties.length > 3 && (
            <Dialog>
              <DialogTrigger>
                <Badge className="hover:bg-gray-300" variant="secondary">
                  +{specialties.length - 3}
                </Badge>
              </DialogTrigger>

              <DialogContent className="max-w-xl w-full">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    {info.row.original.firstName} {info.row.original.lastName}'s
                    Specialties
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  {specialties.map((specialty) => (
                    <span key={`dialog-${specialty}`}>{specialty}</span>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor("yearsOfExperience", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Experience" />
    ),
  }),
  columnHelper.accessor("phoneNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: (info) => {
      return <span>+{info.getValue()}</span>;
    },
  }),
];

type CombinedFilters = {
  globalFilter: string;
  pagination: PaginationState;
};

const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 10,
};

const DEFAULT_GLOBAL_FILTER = "";

export default function Home() {
  const [globalFilter, setGlobalFilter] = useState<string>(
    DEFAULT_GLOBAL_FILTER
  );
  const [pagination, setPagination] =
    useState<PaginationState>(DEFAULT_PAGINATION);

  const combinedFilters = useMemo<CombinedFilters>(() => {
    return { globalFilter, pagination };
  }, [globalFilter, pagination]);

  const [debouncedFilters] = useDebounce(combinedFilters, 300);

  const query = useQuery({
    queryKey: ["search-advocates", debouncedFilters],
    queryFn: async ({ queryKey }) => {
      const searchParams = new URLSearchParams();

      if (queryKey[1]) {
        const { globalFilter, pagination } = queryKey[1] as CombinedFilters;

        if (globalFilter) searchParams.append("search", globalFilter);

        if (pagination.pageIndex)
          searchParams.append("pageIndex", `${pagination.pageIndex}`);

        if (pagination.pageSize)
          searchParams.append("pageSize", `${pagination.pageSize}`);
      }

      const response = await fetch(`/api/advocates?${searchParams.toString()}`);
      if (!response.ok) {
        // get the body of the error or an emtpy object if it doesn't parse properly
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to fetch advocates");
      }

      return (await response.json()) as unknown as AdvocateResponse;
    },

    placeholderData: keepPreviousData, // avoids flashing of empty content on subsequent queries
  });

  const handleGlobalFilterChange = (value: string) => {
    setGlobalFilter(value);
    // reset pagination pageIndex, but keep pageSize
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const table = useReactTable({
    data: query.data?.data ?? [],
    rowCount: query.data?.pagination.rowCount,
    columns: defaultColumns,

    state: {
      globalFilter,
      pagination,
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    onGlobalFilterChange: handleGlobalFilterChange,
    onPaginationChange: setPagination,

    enableRowSelection: false,
    enableSorting: false,

    manualFiltering: true,
    manualPagination: true,
  });

  return (
    <main className="p-6 h-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Solace Advocates</h1>

      <div className="flex flex-row gap-4">
        <Input
          className="w-full lg:w-96"
          placeholder="Search"
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        <Button onClick={() => setGlobalFilter("")}>Reset Search</Button>
      </div>

      <DataTable table={table} loading={query.isLoading} />

      <DataTablePagination table={table} />
    </main>
  );
}
