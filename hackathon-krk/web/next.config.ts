import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the floating Next.js dev badge: it covered the account card in the sidebar.
  devIndicators: false,
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
    return config;
  },
};

export default nextConfig;
