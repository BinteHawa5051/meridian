/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress responses
  compress: true,

  // Faster builds — skip type-check during `next dev`
  typescript: { ignoreBuildErrors: false },

  // Tree-shake large icon/animation libraries
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },

  // Cache API route responses at the edge for 15s (summary, timeseries etc.)
  // Individual routes can override this with their own Cache-Control header.
  async headers() {
    return [
      {
        source: "/api/meridian/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "s-maxage=15, stale-while-revalidate=60",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
