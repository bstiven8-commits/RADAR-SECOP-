import type { Digest } from "./email";

const API = "https://api.telegram.org";

export const telegramConfigurado = () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_USERNAME);

const h = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const cop = (n: number | null) =>
  n == null ? "" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export async function llamar(metodo: string, cuerpo: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN");
  const res = await fetch(`${API}/bot${token}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string; error_code?: number };
  return { ok: !!data.ok, codigo: data.error_code ?? res.status, descripcion: data.description ?? "" };
}

export const enviar = (chatId: number | string, texto: string) =>
  llamar("sendMessage", { chat_id: chatId, text: texto, parse_mode: "HTML", disable_web_page_preview: true });

const POR_ALARMA = 8;
const LIMITE = 3500; // Telegram admite 4096 caracteres por mensaje

// Texto del aviso, partido en mensajes que caben en el límite de Telegram
export function mensajesDigest(digests: Digest[], appUrl: string): string[] {
  const total = digests.reduce((n, d) => n + d.procesos.length, 0);
  const bloques: string[] = [`<b>${total} proceso${total === 1 ? "" : "s"} nuevo${total === 1 ? "" : "s"} en tus alarmas</b>`];
  for (const d of digests) {
    const lineas = d.procesos.slice(0, POR_ALARMA).map((p) => {
      const objeto = h(p.objeto.length > 150 ? `${p.objeto.slice(0, 150).trimEnd()}…` : p.objeto || "(sin descripción)");
      const detalle = [p.entidad, cop(p.valor), p.cierre ? `cierre ${p.cierre.slice(0, 10)}` : ""].filter(Boolean).map(h).join(" · ");
      return `• ${objeto}\n  ${detalle}${p.url ? `\n  <a href="${h(p.url)}">Ver en SECOP</a>` : ""}`;
    });
    const mas = d.procesos.length > POR_ALARMA ? `\n… y ${d.procesos.length - POR_ALARMA} más en ${h(appUrl)}` : "";
    bloques.push(`<b>${h(d.alarma)}</b> (${d.procesos.length})\n${lineas.join("\n")}${mas}`);
  }
  const mensajes: string[] = [];
  let actual = "";
  for (const b of bloques) {
    if (actual && actual.length + b.length + 2 > LIMITE) {
      mensajes.push(actual);
      actual = b;
    } else {
      actual = actual ? `${actual}\n\n${b}` : b;
    }
  }
  if (actual) mensajes.push(actual);
  return mensajes;
}
