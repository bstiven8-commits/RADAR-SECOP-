import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";
import { PLAN_LIMITS, type Plan } from "@/lib/plans";
import { parseFilters } from "@/lib/secop";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Inicia sesión" }, { status: 401 });

export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const db = admin();
  const [{ data: alarms }, { data: profile }] = await Promise.all([
    db.from("alarms").select("id,name,filters,active,created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
    db.from("profiles").select("plan").eq("id", user.id).maybeSingle(),
  ]);
  const plan = (profile?.plan ?? "free") as Plan;
  return NextResponse.json({ alarms: alarms ?? [], plan, limite: PLAN_LIMITS[plan].alarmas });
}

export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const body = (await req.json().catch(() => null)) as { name?: string; filters?: Record<string, string> } | null;
  const name = body?.name?.trim();
  if (!name || !body?.filters) return NextResponse.json({ error: "Faltan nombre o filtros" }, { status: 400 });

  // Normaliza los filtros con la misma lógica de la búsqueda (descarta campos desconocidos)
  const f = parseFilters(new URLSearchParams(body.filters));
  const { desde: _d, hasta: _h, ...filters } = f; // las alarmas miran siempre lo nuevo

  const db = admin();
  const { data: profile } = await db.from("profiles").select("plan").eq("id", user.id).maybeSingle();
  const plan = (profile?.plan ?? "free") as Plan;
  const { count } = await db.from("alarms").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= PLAN_LIMITS[plan].alarmas) {
    return NextResponse.json({ error: `Tu plan permite ${PLAN_LIMITS[plan].alarmas} alarmas` }, { status: 403 });
  }

  const { data, error } = await db
    .from("alarms")
    .insert({ user_id: user.id, name: name.slice(0, 80), filters })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const body = (await req.json().catch(() => null)) as { id?: string; active?: boolean } | null;
  if (!body?.id || typeof body.active !== "boolean") return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  const { error } = await admin().from("alarms").update({ active: body.active }).eq("id", body.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });
  const { error } = await admin().from("alarms").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
