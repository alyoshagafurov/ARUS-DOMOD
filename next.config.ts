import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Фотосъёмка ещё не передана. Когда появятся внешние источники
    // (CDN клиента или headless-бэкенд), хосты добавляются сюда — без этого
    // next/image их не отдаст.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
