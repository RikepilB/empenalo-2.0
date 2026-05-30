import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMPEÑALO — Empeña tu artículo y recibe ofertas",
  description:
    "Marketplace fintech que conecta personas con casas de empeño en Lima. Publica, compara ofertas y elige la mejor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
