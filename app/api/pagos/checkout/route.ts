import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { admin, userFromRequest } from "@/lib/supabase-server";
import { esPlanDePago, PRECIOS_COP } from "@/lib/plans";
import { checkoutUrl, wompiConfigurado } from "@/lib/wompi";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Inicia sesión para continuar" }, { status: 401 });

  if (!wompiConfigurado()) {
    return NextResponse.json({ error: "Los pagos aún no están habilitados. Vuelve a intentarlo pronto." }, { status: 503 });
  }

  const body = (await req.json().catch(() => null)) as { plan?: string } | null;
  if (!esPlanDePago(body?.plan)) return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  const plan = body.plan;

  // El monto sale siempre del servidor, nunca del navegador
  const amountCents = PRECIOS_COP[plan] * 100;
  const reference = `RS-${plan}-${randomBytes(6).toString("hex")}`;

  const { error } = await admin().from("payments").insert({ reference, user_id: user.id, plan, amount_cents: amountCents, currency: "COP" });
  if (error) return NextResponse.json({ error: "No se pudo iniciar el pago" }, { status: 500 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const url = checkoutUrl({ reference, amountCents, redirectUrl: `${appUrl}/pago/resultado?ref=${reference}` });
  return NextResponse.json({ url });
}
