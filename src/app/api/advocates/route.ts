import { NextRequest } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";
import { ilike, or, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const search = url.searchParams.get("search");
  const ilikeValue = `%${search}%`;

  const data = await db
    .select()
    .from(advocates)
    .where(
      search
        ? or(
            ilike(advocates.firstName, ilikeValue),
            ilike(advocates.lastName, ilikeValue),
            ilike(advocates.city, ilikeValue),
            ilike(advocates.degree, ilikeValue),
            sql`${advocates.specialties}::text ILIKE ${ilikeValue}`,
            // ilike(advocates.yearsOfExperience, ilikeValue)
          )
        : undefined
    );

  return Response.json({ data });
}
