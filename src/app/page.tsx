"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { AdvocateResponse } from "./common-types";

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

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span id="search-term"></span>
        </p>
        <input onChange={(e) => setGlobalFilter(e.target.value)} />
        <button onClick={() => setGlobalFilter("")}>Reset Search</button>
      </div>
      <br />
      <br />
      <table>
        <thead>
          <th>First Name</th>
          <th>Last Name</th>
          <th>City</th>
          <th>Degree</th>
          <th>Specialties</th>
          <th>Years of Experience</th>
          <th>Phone Number</th>
        </thead>
        <tbody>
          {query.isLoading ? (
            <span>loading...</span>
          ) : query.data?.data.length ? (
            query.data.data.map((advocate) => {
              return (
                <tr>
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    {advocate.specialties.map((s) => (
                      <div>{s}</div>
                    ))}
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>{advocate.phoneNumber}</td>
                </tr>
              );
            })
          ) : (
            <span>no results...</span>
          )}
        </tbody>
      </table>
    </main>
  );
}
