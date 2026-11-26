import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Estado de un pago del propio usuario (la página de resultado lo consulta hasta que Wompi confirme)
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const ref = new URL(req.url).searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Falta la referencia" }, { status: 400 });

  const db = admin();
  const { data: pago } = await db.from("payments").select("status,plan").eq("reference", ref).eq("user_id", user.id).maybeSingle();
  if (!pago) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  const { data: perfil } = await db.from("profiles").select("plan_expires_at").eq("id", user.id).maybeSingle();
  return NextResponse.json({ status: pago.status, plan: pago.plan, vence: perfil?.plan_expires_at ?? null });
}
