import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const cspValue = [
  "default-src 'self'",
  // 開発時は React が eval() を使うため unsafe-eval が必要
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  // 開発時は HMR の WebSocket 接続を許可
  isDev
    ? "connect-src 'self' ws://localhost:* wss://localhost:*"
    : "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: cspValue },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
