import type { NextConfig } from "next";

// GitHub Pages: export statico (senza /api) servito sotto /fico-site.
// In produzione su Vercel/Netlify resta il build con funzioni server.
const pages = process.env.GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  // Non più un export statico: l'invio delle due email (richiesta allo studio
  // e conferma al cliente) ha bisogno di una funzione lato server, quindi il
  // sito va pubblicato su Vercel.
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
  ...(pages ? { output: "export" as const, basePath: "/fico-site", trailingSlash: true } : {}),
};

export default nextConfig;
