import { createHash, timingSafeEqual } from "node:crypto";

const CHECKOUT = "https://checkout.wompi.co/p/";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export function wompiConfigurado() {
  return Boolean(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET && process.env.WOMPI_EVENTS_SECRET);
}

/** Enlace al Web Checkout de Wompi. La firma se calcula aquí, en el servidor: el secreto nunca llega al navegador. */
export function checkoutUrl(p: { reference: string; amountCents: number; redirectUrl: string }) {
  const publicKey = process.env.WOMPI_PUBLIC_KEY!;
  const secret = process.env.WOMPI_INTEGRITY_SECRET!;
  const currency = "COP";
  const firma = sha256(`${p.reference}${p.amountCents}${currency}${secret}`);
  const q = [
    ["public-key", publicKey],
    ["currency", currency],
    ["amount-in-cents", String(p.amountCents)],
    ["reference", p.reference],
    ["redirect-url", p.redirectUrl],
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return `${CHECKOUT}?${q}&signature:integrity=${firma}`;
}

export interface EventoWompi {
  event: string;
  data: Record<string, unknown>;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
}

const leer = (obj: unknown, ruta: string): unknown =>
  ruta.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);

/** Comprueba que el evento realmente viene de Wompi (SHA256 de las propiedades firmadas + timestamp + secreto de eventos). */
export function eventoValido(ev: EventoWompi, checksumHeader: string | null) {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  const props = ev.signature?.properties;
  const recibido = (checksumHeader ?? ev.signature?.checksum ?? "").toLowerCase();
  if (!secret || !props?.length || ev.timestamp == null || !recibido) return false;
  const base = props.map((r) => String(leer(ev.data, r) ?? "")).join("") + String(ev.timestamp) + secret;
  const esperado = sha256(base);
  const a = Buffer.from(esperado);
  const b = Buffer.from(recibido);
  return a.length === b.length && timingSafeEqual(a, b);
}
