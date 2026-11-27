import type { Metadata } from "next";
import { PRECIOS_COP } from "@/lib/plans";

const NOMBRE = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

export const metadata: Metadata = {
  title: `Planes y precios — ${NOMBRE}`,
  description: `Empieza gratis con 5 alarmas. Los planes Pro y Business desde $${PRECIOS_COP.pro.toLocaleString("es-CO")} COP por 30 días suman alertas cada 15 minutos, Telegram y exportación a Excel.`,
  alternates: { canonical: "/precios" },
};

export default function PreciosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
