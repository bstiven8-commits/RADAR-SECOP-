import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase-server";
import { DIAS_PLAN, esPlanDePago, planVigente, type Plan } from "@/lib/plans";
import { eventoValido, type EventoWompi } from "@/lib/wompi";

export const dynamic = "force-dynamic";

interface Transaccion {
  id?: string;
  status?: string;
  reference?: string;
  amount_in_cents?: number;
  currency?: string;
}

export async function POST(req: Request) {
  if (!process.env.WOMPI_EVENTS_SECRET) return NextResponse.json({ error: "No configurado" }, { status: 503 });

  const ev = (await req.json().catch(() => null)) as EventoWompi | null;
  if (!ev || !eventoValido(ev, req.headers.get("x-event-checksum"))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }
  if (ev.event !== "transaction.updated") return NextResponse.json({ ok: true });

  const tx = (ev.data?.transaction ?? {}) as Transaccion;
  if (!tx.reference || !tx.status) return NextResponse.json({ ok: true });

  const db = admin();
  const { data: pago } = await db.from("payments").select("reference,user_id,plan,amount_cents,currency,status").eq("reference", tx.reference).maybeSingle();
  if (!pago) return NextResponse.json({ ok: true }); // referencia que no es nuestra

  if (tx.status !== "APPROVED") {
    // Rechazado, anulado o con error: solo se anota si todavía estaba pendiente
    await db.from("payments").update({ status: tx.status, wompi_transaction_id: tx.id ?? null }).eq("reference", pago.reference).eq("status", "PENDING");
    return NextResponse.json({ ok: true });
  }

  // El monto y la moneda aprobados deben coincidir con lo que registramos al crear el pago
  if (tx.amount_in_cents !== pago.amount_cents || tx.currency !== pago.currency || !esPlanDePago(pago.plan)) {
    console.error(`Pago ${pago.reference}: monto o moneda no coinciden`);
    return NextResponse.json({ ok: true });
  }

  // Se reclama una sola vez: si Wompi reenvía el evento, la segunda vez no devuelve fila y no suma días
  const { data: reclamado } = await db
    .from("payments")
    .update({ status: "APPROVED", wompi_transaction_id: tx.id ?? null, paid_at: new Date().toISOString() })
    .eq("reference", pago.reference)
    .neq("status", "APPROVED")
    .select("reference");
  if (!reclamado?.length) return NextResponse.json({ ok: true });

  const { data: perfil } = await db.from("profiles").select("plan,plan_expires_at").eq("id", pago.user_id).maybeSingle();
  const ahora = new Date();
  const actual = planVigente((perfil?.plan as Plan) ?? "free", perfil?.plan_expires_at, ahora);
  // Si renueva el mismo plan, los 30 días se suman al vencimiento; si cambia de plan, cuentan desde hoy
  const base = actual === pago.plan && perfil?.plan_expires_at ? new Date(perfil.plan_expires_at) : ahora;
  const vence = new Date(Math.max(base.getTime(), ahora.getTime()) + DIAS_PLAN * 864e5);

  const { error } = await db.from("profiles").update({ plan: pago.plan, plan_expires_at: vence.toISOString() }).eq("id", pago.user_id);
  if (error) {
    // Se deshace el reclamo para que el reintento de Wompi vuelva a activar el plan
    await db.from("payments").update({ status: "PENDING", paid_at: null }).eq("reference", pago.reference);
    return NextResponse.json({ error: "No se pudo activar el plan" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
