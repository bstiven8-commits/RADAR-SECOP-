// Límites por plan. Hoy todos los usuarios son "free"; cuando empieces a cobrar
// basta con cambiar profiles.plan (a mano o desde el webhook de pagos).
export type Plan = "free" | "pro" | "business";

// Cada cuánto se revisa una alarma. "daily" = un resumen al día a las 7:00 a. m. (hora de Colombia).
export type Frecuencia = "daily" | "hourly" | "15min";

export const FRECUENCIAS: Record<Frecuencia, { etiqueta: string; minutos: number }> = {
  daily: { etiqueta: "Resumen diario (7:00 a. m.)", minutos: 24 * 60 },
  hourly: { etiqueta: "Cada hora", minutos: 60 },
  "15min": { etiqueta: "Cada 15 minutos", minutos: 15 },
};

export const FRECUENCIA_POR_DEFECTO: Frecuencia = "daily";

export const PLAN_LIMITS: Record<Plan, { alarmas: number; frecuencias: Frecuencia[] }> = {
  free: { alarmas: 5, frecuencias: ["daily"] },
  pro: { alarmas: 25, frecuencias: ["daily", "hourly", "15min"] },
  business: { alarmas: 100, frecuencias: ["daily", "hourly", "15min"] },
};

export function esFrecuencia(v: unknown): v is Frecuencia {
  return typeof v === "string" && v in FRECUENCIAS;
}
