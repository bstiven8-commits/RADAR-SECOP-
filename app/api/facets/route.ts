import { NextResponse } from "next/server";
import { facet, type Source } from "@/lib/secop";

export const revalidate = 86400;

export async function GET(req: Request) {
  const s = new URL(req.url).searchParams.get("source");
  const source: Source = s === "secop1" || s === "both" ? s : "secop2";
  try {
    const [modalidades, estados, departamentos] = await Promise.all([
      facet(source, "modalidad"),
      facet(source, "estado"),
      facet(source, "departamento"),
    ]);
    return NextResponse.json({ modalidades, estados, departamentos });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
