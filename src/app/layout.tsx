import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Sistema de Asistencia",
  description: "Registro y gestión de asistencias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        <Providers>
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
