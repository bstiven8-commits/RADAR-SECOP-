import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { admin } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

const MAX_POR_IP = 6; // por hora
const MAX_POR_CORREO = 3; // por hora
const MAX_GLOBAL = 150; // por hora, para no agotar el límite de correos del proveedor

const hash = (s: string) =>
  createHash("sha256").update(`${process.env.CRON_SECRET ?? "radar"}:${s}`).digest("hex");

const OK = { ok: true, mensaje: "Te enviamos un enlace de acceso. Revisa tu correo." };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string; web?: string; t?: number } | null;
  const email = (body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Escribe un correo válido." }, { status: 400 });
  }
  // Trampa para bots: campo oculto que una persona nunca llena, y formulario enviado demasiado rápido.
  const rapido = typeof body?.t === "number" && body.t < 1500;
  if (body?.web || rapido) return NextResponse.json(OK); // respuesta falsa: no enviamos nada

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida";
  const ipH = hash(ip);
  const emH = hash(email);
  const db = admin();
  const desde = new Date(Date.now() - 3600_000).toISOString();

  const contar = async (col: "ip_hash" | "email_hash" | null, val?: string) => {
    let q = db.from("auth_intentos").select("id", { count: "exact", head: true }).gte("created_at", desde);
    if (col && val) q = q.eq(col, val);
    const { count } = await q;
    return count ?? 0;
  };
  const [porIp, porCorreo, global] = await Promise.all([contar("ip_hash", ipH), contar("email_hash", emH), contar(null)]);
  if (porIp >= MAX_POR_IP || porCorreo >= MAX_POR_CORREO || global >= MAX_GLOBAL) {
    return NextResponse.json({ error: "Demasiados intentos. Espera un rato e inténtalo de nuevo." }, { status: 429 });
  }

  await db.from("auth_intentos").insert({ ip_hash: ipH, email_hash: emH });
  // Limpieza de registros viejos (más de 2 días)
  void db.from("auth_intentos").delete().lt("created_at", new Date(Date.now() - 2 * 86400_000).toISOString());

  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin).replace(/\/$/, "");
  const { error } = await anon.auth.signInWithOtp({ email, options: { emailRedirectTo: origin } });
  if (error) {
    const limite = /rate|seconds|too many/i.test(error.message);
    return NextResponse.json(
      { error: limite ? "Espera un momento antes de pedir otro enlace." : "No pudimos enviar el enlace. Inténtalo de nuevo." },
      { status: limite ? 429 : 500 },
    );
  }
  return NextResponse.json(OK);
}
