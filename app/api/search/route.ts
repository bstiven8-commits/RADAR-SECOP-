import { NextResponse } from "next/server";
import { parseFilters, search } from "@/lib/secop";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const page = Math.max(0, Number(sp.get("page")) || 0);
  try {
    const data = await search(parseFilters(sp), page, 20);
    // La misma búsqueda repetida se sirve desde la caché de Vercel un minuto: menos consultas a datos.gov.co
    return NextResponse.json(data, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    console.error("Búsqueda falló:", (e as Error).message);
    return NextResponse.json({ error: "No pudimos consultar SECOP en este momento. Inténtalo de nuevo en unos minutos." }, { status: 502 });
  }
}
