import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";
import { PLAN_LIMITS, planVigente, type Plan } from "@/lib/plans";

export const dynamic = "force-dynamic";

const ESTADOS = ["interesa", "postulado", "descartado"] as const;
const noAuth = () => NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
const fuenteOk = (s: unknown): s is "secop1" | "secop2" => s === "secop1" || s === "secop2";

async function planDe(userId: string): Promise<Plan> {
  const { data } = await admin().from("profiles").select("plan,plan_expires_at").eq("id", userId).maybeSingle();
  const base: Plan = data?.plan && (data.plan as Plan) in PLAN_LIMITS ? (data.plan as Plan) : "free";
  return planVigente(base, data?.plan_expires_at);
}

// Lista los favoritos del usuario (y el límite de su plan)
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return noAuth();
  const { data } = await admin()
    .from("favoritos")
    .select("source,proceso_id,estado_seguimiento,nota,objeto,entidad,valor,cierre,url,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const plan = await planDe(user.id);
  return NextResponse.json({ favoritos: data ?? [], plan, limite: PLAN_LIMITS[plan].favoritos });
}

// Guarda un proceso
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return noAuth();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !fuenteOk(b.source) || typeof b.id !== "string" || !b.id || b.id.length > 100) {
    return NextResponse.json({ error: "Proceso inválido" }, { status: 400 });
  }
  const db = admin();
  const plan = await planDe(user.id);
  const { count } = await db.from("favoritos").select("proceso_id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= PLAN_LIMITS[plan].favoritos) {
    return NextResponse.json(
      { error: `Llegaste al límite de ${PLAN_LIMITS[plan].favoritos} procesos guardados de tu plan. Quita alguno o mejora tu plan.` },
      { status: 403 },
    );
  }
  const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
  const cierre = typeof b.cierre === "string" && !isNaN(Date.parse(b.cierre)) ? new Date(b.cierre).toISOString() : null;
  const url = typeof b.url === "string" && /^https?:\/\//i.test(b.url) ? b.url.slice(0, 1000) : null;
  const { error } = await db.from("favoritos").upsert(
    {
      user_id: user.id,
      source: b.source,
      proceso_id: b.id,
      objeto: texto(b.objeto, 1000),
      entidad: texto(b.entidad, 300),
      valor: typeof b.valor === "number" && isFinite(b.valor) ? b.valor : null,
      cierre,
      url,
    },
    { onConflict: "user_id,source,proceso_id", ignoreDuplicates: true },
  );
  if (error) return NextResponse.json({ error: "No pudimos guardar el proceso" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Cambia el estado de seguimiento o la nota
export async function PATCH(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return noAuth();
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!b || !fuenteOk(b.source) || typeof b.id !== "string") return NextResponse.json({ error: "Proceso inválido" }, { status: 400 });
  const cambios: Record<string, string> = {};
  if (b.estado !== undefined) {
    if (!ESTADOS.includes(b.estado as (typeof ESTADOS)[number])) return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    cambios.estado_seguimiento = b.estado as string;
  }
  if (b.nota !== undefined) {
    if (typeof b.nota !== "string") return NextResponse.json({ error: "Nota inválida" }, { status: 400 });
    cambios.nota = b.nota.slice(0, 500);
  }
  if (!Object.keys(cambios).length) return NextResponse.json({ error: "Nada que cambiar" }, { status: 400 });
  const { error } = await admin().from("favoritos").update(cambios).eq("user_id", user.id).eq("source", b.source).eq("proceso_id", b.id);
  if (error) return NextResponse.json({ error: "No pudimos actualizar" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Quita un proceso guardado
export async function DELETE(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return noAuth();
  const u = new URL(req.url);
  const source = u.searchParams.get("source");
  const id = u.searchParams.get("id");
  if (!fuenteOk(source) || !id) return NextResponse.json({ error: "Proceso inválido" }, { status: 400 });
  const { error } = await admin().from("favoritos").delete().eq("user_id", user.id).eq("source", source).eq("proceso_id", id);
  if (error) return NextResponse.json({ error: "No pudimos quitarlo" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
