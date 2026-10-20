import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Native .node bindings break when webpack bundles bigint-buffer; keep it on Node require.
  serverExternalPackages: ["bigint-buffer", "bindings"],
  // Proxy PostHog through our own domain so tracking protection / ad blockers don't drop events.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://eu-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://eu.i.posthog.com/:path*" },
    ];
  },
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
