import { count, ilike, or, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const search = url.searchParams.get("search");
  const ilikeValue = `%${search}%`;

  const pageIndex = parseInt(url.searchParams.get("pageIndex") ?? "0");

  if (isNaN(pageIndex)) {
    return Response.json(
      { message: "page index must be valid" },
      { status: 400 }
    );
  }

  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  if (isNaN(pageSize)) {
    return Response.json(
      { message: "page size must be valid" },
      { status: 400 }
    );
  }

  const offset = pageIndex * pageSize;

  const whereClause = search
    ? or(
        ilike(advocates.firstName, ilikeValue),
        ilike(advocates.lastName, ilikeValue),
        ilike(advocates.city, ilikeValue),
        ilike(advocates.degree, ilikeValue),
        sql`${advocates.specialties}::text ILIKE ${ilikeValue}`
        // ilike(advocates.yearsOfExperience, ilikeValue)
      )
    : undefined;

  const [{ rowCount }] = await db
    .select({ rowCount: count() })
    .from(advocates)
    .where(whereClause);

  const data = await db
    .select()
    .from(advocates)
    .where(whereClause)
    .offset(offset)
    .limit(pageSize);

  return Response.json({ data, pagination: { pageIndex, pageSize, rowCount } });
}
