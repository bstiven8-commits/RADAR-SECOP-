import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";
import { PLAN_LIMITS, planVigente, type Plan } from "@/lib/plans";
import { telegramConfigurado } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// POST: genera un código de un solo uso y devuelve el enlace para abrir el bot de Telegram.
export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  if (!telegramConfigurado()) return NextResponse.json({ error: "Telegram aún no está disponible" }, { status: 503 });

  const db = admin();
  const { data } = await db.from("profiles").select("plan,plan_expires_at").eq("id", user.id).maybeSingle();
  const base: Plan = data?.plan && (data.plan as Plan) in PLAN_LIMITS ? (data.plan as Plan) : "free";
  if (planVigente(base, data?.plan_expires_at) === "free") {
    return NextResponse.json({ error: "Los avisos por Telegram son parte de los planes Pro y Business." }, { status: 403 });
  }

  const code = randomBytes(12).toString("hex");
  const { error } = await db
    .from("profiles")
    .update({ telegram_link_code: code, telegram_link_expires: new Date(Date.now() + 15 * 60_000).toISOString() })
    .eq("id", user.id);
  if (error) return NextResponse.json({ error: "No pudimos generar el enlace" }, { status: 500 });
  return NextResponse.json({ url: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${code}` });
}

// DELETE: desvincula Telegram de la cuenta.
export async function DELETE(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const { error } = await admin()
    .from("profiles")
    .update({ telegram_chat_id: null, telegram_link_code: null, telegram_link_expires: null })
    .eq("id", user.id);
  if (error) return NextResponse.json({ error: "No pudimos desvincular Telegram" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
