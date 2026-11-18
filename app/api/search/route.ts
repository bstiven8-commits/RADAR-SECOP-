import { NextResponse } from "next/server";
import { parseFilters, search } from "@/lib/secop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const page = Math.max(0, Number(sp.get("page")) || 0);
  try {
    return NextResponse.json(await search(parseFilters(sp), page, 20));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
