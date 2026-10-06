import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", destination: "/design/index.html" },
        { source: "/design", destination: "/design/index.html" },
      ],
    };
  },
  // Native .node bindings break when webpack bundles bigint-buffer; keep it on Node require.
  serverExternalPackages: ["bigint-buffer", "bindings"],
  webpack: (config, { isServer }) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    if (isServer) {
      const prev = config.externals;
      config.externals = [
        ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
        { "bigint-buffer": "commonjs bigint-buffer", bindings: "commonjs bindings" },
      ];
    }
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
