import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/** HTTPS deployments only — avoid caching HSTS on http://localhost during local `next start`. */
const enableHsts =
  isProd &&
  (process.env.VERCEL === "1" ||
    process.env.RAILWAY_ENVIRONMENT === "production" ||
    process.env.FORCE_HSTS === "1");

/**
 * Content-Security-Policy for the marketing site.
 * `unsafe-inline` / `unsafe-eval` on script: required for Next.js + React without per-request nonces.
 * Tighten over time using `experimental.csp` / nonces when you adopt stricter policies.
 */
function contentSecurityPolicy(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
  ];
  return directives.join("; ");
}

const securityHeaders: { key: string; value: string }[] = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
];

if (isProd) {
  if (enableHsts) {
    securityHeaders.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }
  securityHeaders.push({
    key: "Content-Security-Policy",
    value: contentSecurityPolicy(),
  });
}

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
