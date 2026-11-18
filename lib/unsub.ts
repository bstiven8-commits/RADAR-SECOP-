import { createHmac, timingSafeEqual } from "node:crypto";

// Enlace de baja firmado: no requiere iniciar sesión (como exige la ley para correos de alertas).
// Se firma con CRON_SECRET para no agregar otra variable de entorno.
function firma(userId: string): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error("Falta CRON_SECRET");
  return createHmac("sha256", secret).update(`baja:${userId}`).digest("hex");
}

export function bajaUrl(appUrl: string, userId: string): string {
  return `${appUrl}/api/baja?u=${encodeURIComponent(userId)}&t=${firma(userId)}`;
}

export function firmaValida(userId: string, token: string): boolean {
  try {
    const a = Buffer.from(firma(userId), "hex");
    const b = Buffer.from(token, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
