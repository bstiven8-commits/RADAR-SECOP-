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

// Precios en pesos colombianos. El plan se paga por 30 días y no se renueva solo.
export const PRECIOS_COP: Record<Exclude<Plan, "free">, number> = { pro: 19_900, business: 59_900 };
export const DIAS_PLAN = 30;

export function esPlanDePago(v: unknown): v is Exclude<Plan, "free"> {
  return v === "pro" || v === "business";
}

/** Plan que realmente aplica hoy: si el pago venció, vuelve a free. Sin vencimiento (null) = asignado a mano. */
export function planVigente(plan: Plan, expira: string | null | undefined, ahora: Date = new Date()): Plan {
  if (plan === "free") return "free";
  if (!expira) return plan;
  return new Date(expira).getTime() > ahora.getTime() ? plan : "free";
}
