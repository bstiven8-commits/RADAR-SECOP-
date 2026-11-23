import type { Frecuencia } from "./plans";

// 7:00 a. m. en Colombia (UTC-5, sin horario de verano) = 12:00 UTC.
const HORA_RESUMEN_UTC = 12;

// Margen para que el retraso normal del cron externo no haga saltar una revisión.
const MINUTOS_MINIMOS: Record<Exclude<Frecuencia, "daily">, number> = {
  "15min": 10,
  hourly: 50,
};

/** ¿Le toca a esta alarma ser revisada ahora? `ultima` es el último chequeo exitoso (ISO) o null. */
export function tocaRevisar(frecuencia: Frecuencia, ultima: string | null, ahora: Date = new Date()): boolean {
  if (!ultima) return true; // nunca revisada: se revisa ya (la primera vez solo guarda la línea base)
  const last = new Date(ultima).getTime();
  if (Number.isNaN(last)) return true;

  if (frecuencia === "daily") {
    // Última marca de las 7:00 a. m. (Colombia) que ya pasó
    const marca = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate(), HORA_RESUMEN_UTC));
    if (ahora.getTime() < marca.getTime()) marca.setUTCDate(marca.getUTCDate() - 1);
    return last < marca.getTime();
  }
  return ahora.getTime() - last >= MINUTOS_MINIMOS[frecuencia] * 60_000;
}
