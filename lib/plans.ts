// Límites por plan. Hoy todos los usuarios son "free"; cuando empieces a cobrar
// basta con cambiar profiles.plan (a mano o desde el webhook de pagos).
export type Plan = "free" | "pro" | "business";

export const PLAN_LIMITS: Record<Plan, { alarmas: number }> = {
  free: { alarmas: 5 },
  pro: { alarmas: 25 },
  business: { alarmas: 100 },
};
