import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";
import { esFrecuencia, FRECUENCIA_POR_DEFECTO, FRECUENCIAS, PLAN_LIMITS, planVigente, type Frecuencia, type Plan } from "@/lib/plans";
import { parseFilters } from "@/lib/secop";

export const dynamic = "force-dynamic";

const unauthorized = () => NextResponse.json({ error: "Inicia sesión" }, { status: 401 });

async function perfilDe(userId: string): Promise<{ plan: Plan; vence: string | null }> {
  const { data } = await admin().from("profiles").select("plan,plan_expires_at").eq("id", userId).maybeSingle();
  const plan = data?.plan as Plan | undefined;
  const base: Plan = plan && plan in PLAN_LIMITS ? plan : "free";
  // Si el pago venció, aplica el plan gratuito
  return { plan: planVigente(base, data?.plan_expires_at), vence: data?.plan_expires_at ?? null };
}

const planDe = async (userId: string) => (await perfilDe(userId)).plan;

const noPermitida = (f: Frecuencia, plan: Plan) =>
  NextResponse.json(
    { error: `"${FRECUENCIAS[f].etiqueta}" no está incluida en tu plan ${plan}. Actualiza tu plan para usarla.` },
    { status: 403 },
  );

export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const db = admin();
  const { data: alarms } = await db
    .from("alarms")
    .select("id,name,filters,active,frequency,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const { plan, vence } = await perfilDe(user.id);
  return NextResponse.json({
    alarms: alarms ?? [],
    plan,
    vence: plan === "free" ? null : vence,
    limite: PLAN_LIMITS[plan].alarmas,
    frecuencias: PLAN_LIMITS[plan].frecuencias,
    etiquetas: Object.fromEntries(Object.entries(FRECUENCIAS).map(([k, v]) => [k, v.etiqueta])),
  });
}

export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const body = (await req.json().catch(() => null)) as { name?: string; filters?: Record<string, string>; frequency?: string } | null;
  const name = body?.name?.trim();
  if (!name || !body?.filters) return NextResponse.json({ error: "Faltan nombre o filtros" }, { status: 400 });

  const pedida = body.frequency ?? FRECUENCIA_POR_DEFECTO;
  if (!esFrecuencia(pedida)) return NextResponse.json({ error: "Frecuencia inválida" }, { status: 400 });
  const frequency: Frecuencia = pedida;

  // Normaliza los filtros con la misma lógica de la búsqueda (descarta campos desconocidos)
  const f = parseFilters(new URLSearchParams(body.filters));
  const { desde: _d, hasta: _h, ...filters } = f; // las alarmas miran siempre lo nuevo

  const db = admin();
  const plan = await planDe(user.id);
  if (!PLAN_LIMITS[plan].frecuencias.includes(frequency)) return noPermitida(frequency, plan);

  const { count } = await db.from("alarms").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= PLAN_LIMITS[plan].alarmas) {
    return NextResponse.json({ error: `Tu plan permite ${PLAN_LIMITS[plan].alarmas} alarmas` }, { status: 403 });
  }

  const { data, error } = await db
    .from("alarms")
    .insert({ user_id: user.id, name: name.slice(0, 80), filters, frequency })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}

export async function PATCH(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return unauthorized();
  const body = (await req.json().catch(() => null)) as { id?: string; active?: boolean; frequency?: string } | null;
  if (!body?.id || (typeof body.active !== "boolean" && body.frequency === undefined)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const cambios: { active?: boolean; frequency?: Frecuencia } = {};
  if (typeof body.active === "boolean") cambios.active = body.active;
  if (body.frequency !== undefined) {
    if (!esFrecuencia(body.frequency)) return NextResponse.json({ error: "Frecuencia inválida" }, { status: 400 });
    const plan = await planDe(user.id);
    if (!PLAN_LIMITS[plan].frecuencias.includes(body.frequency)) return noPermitida(body.frequency, plan);
    cambios.frequency = body.frequency;
  }

  const { error } = await admin().from("alarms").update(cambios).eq("id", body.id).eq("user_id", user.id);
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
