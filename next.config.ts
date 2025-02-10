import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: ["image.tmdb.org", "www.gravatar.com"],
  },
};

export default nextConfig;
