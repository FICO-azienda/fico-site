import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Non più un export statico: l'invio delle due email (richiesta allo studio
  // e conferma al cliente) ha bisogno di una funzione lato server, quindi il
  // sito va pubblicato su Vercel.
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
