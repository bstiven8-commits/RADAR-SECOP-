import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";
import { PLAN_LIMITS, planVigente, type Plan } from "@/lib/plans";
import { parseFilters, search } from "@/lib/secop";

export const dynamic = "force-dynamic";

const MAX_FILAS = 200;

// Evita inyección de fórmulas en Excel si un texto de SECOP empieza con = + - @
const celda = (v: unknown) => {
  let s = v == null ? "" : String(v).replace(/\r?\n/g, " ").trim();
  if (/^[=+\-@\t]/.test(s) && !/^-?\d+([.,]\d+)?$/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

// Exporta los resultados de una búsqueda a CSV (se abre en Excel). Solo planes de pago.
export async function GET(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Inicia sesión para exportar" }, { status: 401 });

  const { data } = await admin().from("profiles").select("plan,plan_expires_at").eq("id", user.id).maybeSingle();
  const base = (data?.plan as Plan | undefined) && (data!.plan as Plan) in PLAN_LIMITS ? (data!.plan as Plan) : "free";
  if (planVigente(base, data?.plan_expires_at) === "free") {
    return NextResponse.json({ error: "Exportar a Excel es parte de los planes Pro y Business." }, { status: 403 });
  }

  try {
    const { items } = await search(parseFilters(new URL(req.url).searchParams), 0, MAX_FILAS);
    const cab = ["Plataforma", "ID del proceso", "Referencia", "Entidad", "Objeto", "Modalidad", "Estado", "Fase", "Departamento", "Ciudad",
      "Valor (COP)", "Fecha de publicación", "Cierre de ofertas", "Proveedores invitados", "Enlace"];
    const filas = items.map((p) => [
      p.source === "secop2" ? "SECOP II" : "SECOP I", p.id, p.referencia, p.entidad, p.objeto, p.modalidad, p.estado, p.fase, p.departamento, p.ciudad,
      p.valor ?? "", p.fecha?.slice(0, 10), p.cierre?.slice(0, 16).replace("T", " "), p.invitados ?? "", p.url,
    ]);
    // Punto y coma y BOM: Excel en español lo abre en columnas y con tildes correctas
    const csv = "﻿" + [cab, ...filas].map((f) => f.map(celda).join(";")).join("\r\n");
    const dia = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="radar-secop-${dia}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("Exportación falló:", (e as Error).message);
    return NextResponse.json({ error: "No pudimos generar el archivo en este momento. Inténtalo de nuevo." }, { status: 502 });
  }
}
