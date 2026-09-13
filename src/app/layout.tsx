import type { Metadata, Viewport } from "next";
import { Jost, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const display = Jost({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-display", display: "swap" });
const ui = Inter({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-ui", display: "swap" });
/* serif editoriale, usato soltanto per le domande di ASK FICO */
const ask = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-ask", display: "swap" });

export const metadata: Metadata = {
  title: "FICO",
  description: "Studio di design e sviluppo web.",
};

export const viewport: Viewport = { themeColor: "#050607" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${ui.variable} ${ask.variable}`}>
      <body>{children}</body>
    </html>
  );
}
