import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const nombre = process.env.NEXT_PUBLIC_APP_NAME ?? "Radar SECOP";

const sans = Schibsted_Grotesk({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  title: `${nombre} — procesos de SECOP I y II`,
  description: "Busca procesos de contratación pública de SECOP I y II y recibe alertas por correo cuando aparezcan nuevos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
