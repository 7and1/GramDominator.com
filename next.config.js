/** @type {import('next').NextConfig} */
const nextConfig = {
  // Memory optimization for development
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 3,
  },

  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.tiktokcdn.com" },
      { protocol: "https", hostname: "p16-va.tiktokcdn.com" },
      { protocol: "https", hostname: "p16-sign.tiktokcdn.com" },
    ],
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "child-src 'self'",
              "connect-src 'self' *.tiktokcdn.com p16-va.tiktokcdn.com p16-sign.tiktokcdn.com",
              "font-src 'self' data:",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "frame-src 'self'",
              "img-src 'self' data: blob: *.tiktokcdn.com p16-va.tiktokcdn.com p16-sign.tiktokcdn.com",
              "manifest-src 'self'",
              "media-src 'self' *.tiktokcdn.com p16-va.tiktokcdn.com",
              "object-src 'none'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "script-src-elem 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "style-src-elem 'self' 'unsafe-inline'",
              "worker-src 'self' blob:",
            ].join("; "),
          },
          // DNS Prefetch Control
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
          // HTTP Strict Transport Security (only enable in production with HTTPS)
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
          // Frame Options
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Content Type Options
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer Policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
          // XSS Protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Cross Origin Opener Policy
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Cross Origin Resource Policy
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
      // API routes - additional security
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; connect-src 'self' *.tiktokcdn.com",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
