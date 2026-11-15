import type { NextConfig } from "next";

// Cloudflare Workers の静的アセットとして配信するため（wrangler.jsonc 参照）、全ページを静的ファイル（out/）として書き出す。
// 静的書き出しでは headers() が使えないため、セキュリティヘッダーは public/_headers に定義している。
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
