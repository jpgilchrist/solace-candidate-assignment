"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Advocate, AdvocateResponse } from "./common-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table-header";
import { DataTablePagination } from "@/components/data-table-pagination";

const columnHelper = createColumnHelper<Advocate>();
const defaultColumns = [
  columnHelper.accessor("firstName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="First Name" />
    ),
  }),
  columnHelper.accessor("lastName", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Name" />
    ),
  }),
  columnHelper.accessor("city", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="City" />
    ),
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
  }),
  columnHelper.accessor("yearsOfExperience", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Experience" />
    ),
  }),
  columnHelper.accessor("phoneNumber", {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
  }),
];

export default function Home() {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [debouncedGlobalFilter] = useDebounce(globalFilter, 300);

  const query = useQuery({
    queryKey: ["search-advocates", debouncedGlobalFilter],
    queryFn: async ({ queryKey }) => {
      const searchParams = new URLSearchParams();
      if (queryKey[1]) {
        searchParams.append("search", queryKey[1]);
      }

      const response = await fetch(`/api/advocates?${searchParams.toString()}`);
      if (!response.ok) {
        // get the body of the error or an emtpy object if it doesn't parse properly
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to fetch advocates");
      }

      return (await response.json()) as unknown as AdvocateResponse;
    },
  });

  const table = useReactTable({
    data: query.data?.data ?? [],
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: false,
  });

  return (
    <main className="p-6 h-full flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Solace Advocates</h1>

      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <Input onChange={(e) => setGlobalFilter(e.target.value)} />
        <Button onClick={() => setGlobalFilter("")}>Reset Search</Button>
      </div>

      <DataTable table={table} loading={query.isLoading} />
      <DataTablePagination table={table} />
    </main>
  );
}
