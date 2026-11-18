import type { Metadata } from "next";
import "./globals.css";

const nombre = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

export const metadata: Metadata = {
  title: `${nombre} — procesos de SECOP I y II`,
  description: "Busca procesos de contratación pública de SECOP I y II y recibe alertas por correo cuando aparezcan nuevos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
