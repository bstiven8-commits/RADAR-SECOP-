import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase-server";
import { search, type Filters, type Proceso } from "@/lib/secop";
import { digestHtml, sendEmail, type Digest } from "@/lib/email";
import { bajaUrl } from "@/lib/unsub";
import { esFrecuencia, FRECUENCIA_POR_DEFECTO } from "@/lib/plans";
import { tocaRevisar } from "@/lib/frecuencia";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VENTANA_DIAS = 7; // ventana móvil: tolera el retraso con que SECOP publica en datos abiertos

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const db = admin();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const ahora = new Date();
  const desde = new Date(ahora.getTime() - VENTANA_DIAS * 864e5).toISOString().slice(0, 10);

  const { data: alarms, error } = await db
    .from("alarms")
    .select("id,user_id,name,filters,baselined,frequency,last_checked_at")
    .eq("active", true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const porUsuario = new Map<string, Digest[]>();
  let revisadas = 0;
  let omitidas = 0;
  let fallidas = 0;

  for (const a of alarms ?? []) {
    const frecuencia = esFrecuencia(a.frequency) ? a.frequency : FRECUENCIA_POR_DEFECTO;
    if (!tocaRevisar(frecuencia, a.last_checked_at, ahora)) {
      omitidas++;
      continue;
    }

    revisadas++;
    try {
      const { items } = await search({ ...(a.filters as Filters), desde, hasta: undefined }, 0, 50);

      let nuevos: Proceso[] = [];
      if (items.length) {
        const { data: vistos } = await db
          .from("alarm_hits")
          .select("process_key")
          .eq("alarm_id", a.id)
          .in("process_key", items.map((p) => p.key));
        const ya = new Set((vistos ?? []).map((v) => v.process_key));
        nuevos = items.filter((p) => !ya.has(p.key));

        if (nuevos.length) {
          await db
            .from("alarm_hits")
            .upsert(nuevos.map((p) => ({ alarm_id: a.id, process_key: p.key })), { onConflict: "alarm_id,process_key", ignoreDuplicates: true });
        }
      }

      // Primera corrida: se guarda la línea base sin avisar (evita un correo con 7 días de procesos viejos)
      if (!a.baselined) {
        await db.from("alarms").update({ baselined: true, last_checked_at: ahora.toISOString() }).eq("id", a.id);
        continue;
      }

      if (nuevos.length) {
        const lista = porUsuario.get(a.user_id) ?? [];
        lista.push({ alarma: a.name, procesos: nuevos });
        porUsuario.set(a.user_id, lista);
      }
      await db.from("alarms").update({ last_checked_at: ahora.toISOString() }).eq("id", a.id);
    } catch (e) {
      // Sin actualizar last_checked_at: se reintenta en la siguiente corrida
      fallidas++;
      console.error(`Alarma ${a.id} falló:`, (e as Error).message);
    }
  }

  let correos = 0;
  for (const [userId, digests] of porUsuario) {
    const { data: perfil } = await db.from("profiles").select("email").eq("id", userId).maybeSingle();
    if (!perfil?.email) continue;
    const total = digests.reduce((n, d) => n + d.procesos.length, 0);
    try {
      const baja = bajaUrl(appUrl, userId);
      await sendEmail(perfil.email, `${total} proceso${total === 1 ? "" : "s"} nuevo${total === 1 ? "" : "s"} en tus alarmas`, digestHtml(digests, appUrl, baja), baja);
      correos++;
    } catch (e) {
      console.error(`Correo a ${userId} falló:`, (e as Error).message);
    }
  }

  return NextResponse.json({ revisadas, omitidas, fallidas, correos });
}
