import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase-server";
import { enviar, llamar } from "@/lib/telegram";

export const dynamic = "force-dynamic";

const igual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

// GET ?setup=<TELEGRAM_WEBHOOK_SECRET>: registra este endpoint en Telegram (se abre una sola vez).
export async function GET(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const setup = new URL(req.url).searchParams.get("setup") ?? "";
  if (!secret || !igual(setup, secret)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const r = await llamar("setWebhook", { url: `${base}/api/telegram/webhook`, secret_token: secret, allowed_updates: ["message"] });
  return NextResponse.json(r);
}

// POST: mensajes que Telegram envía al bot. Siempre responde 200 para que no reintente.
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || !igual(req.headers.get("x-telegram-bot-api-secret-token") ?? "", secret)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const update = (await req.json().catch(() => null)) as { message?: { text?: string; chat?: { id: number; type?: string } } } | null;
  const chatId = update?.message?.chat?.id;
  const texto = (update?.message?.text ?? "").trim();
  if (!chatId || update?.message?.chat?.type !== "private") return NextResponse.json({ ok: true });

  const db = admin();
  const [cmd, arg] = texto.split(/\s+/);

  if (cmd === "/start" && arg) {
    const { data: perfil } = await db
      .from("profiles")
      .select("id,telegram_link_expires")
      .eq("telegram_link_code", arg)
      .maybeSingle();
    if (!perfil || !perfil.telegram_link_expires || new Date(perfil.telegram_link_expires) < new Date()) {
      await enviar(chatId, "Este enlace venció o no es válido. Genera uno nuevo desde “Mis alarmas” en alertasecop.com.");
      return NextResponse.json({ ok: true });
    }
    const { error } = await db
      .from("profiles")
      .update({ telegram_chat_id: chatId, telegram_link_code: null, telegram_link_expires: null })
      .eq("id", perfil.id);
    await enviar(
      chatId,
      error
        ? "No pudimos vincular este chat (puede estar ya vinculado a otra cuenta). Escríbenos si necesitas ayuda."
        : "Listo, tu cuenta quedó vinculada. Te avisaré por aquí cuando aparezcan procesos nuevos en tus alarmas. Escribe /stop para dejar de recibir avisos.",
    );
  } else if (cmd === "/stop") {
    await db.from("profiles").update({ telegram_chat_id: null }).eq("telegram_chat_id", chatId);
    await enviar(chatId, "Listo, no recibirás más avisos por Telegram. Puedes volver a conectarlo desde “Mis alarmas”.");
  } else {
    await enviar(chatId, "Hola. Para recibir avisos, entra a “Mis alarmas” en alertasecop.com y pulsa “Conectar Telegram”. /stop para dejar de recibirlos.");
  }
  return NextResponse.json({ ok: true });
}
