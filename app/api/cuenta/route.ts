import { NextResponse } from "next/server";
import { admin, userFromRequest } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

// Elimina la cuenta del usuario autenticado. Las alarmas, el perfil y los registros de pago
// se borran en cascada (on delete cascade sobre auth.users).
export async function DELETE(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return NextResponse.json({ error: "Inicia sesión" }, { status: 401 });
  const { error } = await admin().auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: "No pudimos eliminar la cuenta. Inténtalo de nuevo o escríbenos." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
