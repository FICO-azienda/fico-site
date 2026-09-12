import type { Metadata, Viewport } from "next";
import { Jost, Inter } from "next/font/google";
import "./globals.css";

/* Jost richiama la geometria del marchio; Inter tiene pulita l'interfaccia. */
const display = Jost({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const ui = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-ui",
  display: "swap",
  preload: true,
});

const SITE = "https://fico.studio";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "FICO — Websites for a brighter tomorrow",
  description:
    "FICO is a digital studio that designs and develops websites for businesses: we build digital worlds for real businesses.",
  keywords: [
    "web design studio",
    "web development",
    "digital experience",
    "immersive website",
    "e-commerce",
  ],
  openGraph: {
    type: "website",
    url: SITE,
    title: "FICO — Websites for a brighter tomorrow",
    description: "We build digital worlds for real businesses.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "FICO" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FICO — Websites for a brighter tomorrow",
    description: "We build digital worlds for real businesses.",
    images: ["/og.jpg"],
  },
  alternates: { canonical: SITE },
};

export const viewport: Viewport = {
  themeColor: "#050607",
  colorScheme: "dark",
};

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "FICO",
  description:
    "Digital studio designing and developing websites and interactive experiences for businesses.",
  slogan: "Websites for a brighter tomorrow",
  url: SITE,
  email: "ciao@fico.studio",
  areaServed: "Worldwide",
  knowsAbout: [
    "Web design",
    "Web development",
    "Digital identity",
    "Interactive experiences",
    "E-commerce",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${ui.variable}`}>
      <head>
        <link rel="preload" as="video" href="/video/fico-film.mp4" type="video/mp4" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
