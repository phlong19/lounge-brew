import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { remoteImagePatterns } from "./src/lib/config/image-patterns";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_R2_MEDIA_URL: process.env.R2_PUBLIC_BASE_URL || "" },
  images: {
    unoptimized: process.env.CLOUDFLARE_WORKER_BUILD === "1",
    remotePatterns: remoteImagePatterns(process.env.NEXT_PUBLIC_SUPABASE_URL),
  },
};

export default withNextIntl(nextConfig);
