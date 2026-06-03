import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAI Ticketing - Sistem Pemesanan Tiket Kereta",
  description: "Platform pemesanan tiket kereta api Indonesia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
