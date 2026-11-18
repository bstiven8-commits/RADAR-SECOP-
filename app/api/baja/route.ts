import { admin } from "@/lib/supabase-server";
import { firmaValida } from "@/lib/unsub";

export const dynamic = "force-dynamic";

const pagina = (titulo: string, texto: string, status: number) =>
  new Response(
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${titulo}</title><body style="font-family:system-ui,sans-serif;max-width:520px;margin:15vh auto;padding:0 16px">
<h2>${titulo}</h2><p>${texto}</p><p><a href="/alarmas">Ir a mis alarmas</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

async function desactivar(u: string | null, t: string | null) {
  if (!u || !t || !firmaValida(u, t)) {
    return pagina("Enlace inválido", "El enlace de baja no es válido o está incompleto.", 400);
  }
  const { error } = await admin().from("alarms").update({ active: false }).eq("user_id", u);
  if (error) return pagina("Error", "No pudimos procesar la baja. Inténtalo de nuevo.", 500);
  return pagina("Listo, no recibirás más correos", "Pausamos todas tus alarmas. Puedes reactivarlas cuando quieras desde tu cuenta.", 200);
}

// GET: clic desde el correo. POST: "baja con un clic" del cliente de correo (List-Unsubscribe-Post).
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return desactivar(sp.get("u"), sp.get("t"));
}

export async function POST(req: Request) {
  const sp = new URL(req.url).searchParams;
  return desactivar(sp.get("u"), sp.get("t"));
}
