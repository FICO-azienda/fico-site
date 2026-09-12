import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sito interamente statico: si pubblica su qualsiasi hosting (Vercel,
  // Netlify, GitHub Pages) senza bisogno di un server Node.
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
