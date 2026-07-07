import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Fotos já chegam re-encodadas/redimensionadas do cliente (~2000px);
      // 10mb dá folga confortável para o multipart sem abrir demais o limite.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
