import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.alias = {
      ...config.resolve.alias,
      // Prevent @solana/kit browser break via mobile wallet adapter
      "@solana-mobile/wallet-adapter-mobile": path.resolve(
        __dirname,
        "src/stubs/solana-mobile-wallet-adapter.js"
      ),
    };
    return config;
  },
};

export default nextConfig;
