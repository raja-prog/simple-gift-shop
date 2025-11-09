import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      }
      ,
      {
        protocol: "https",
        hostname: "rukminim2.flixcart.com",
      }
    ],
    // Allow SVG/data URLs when needed (fallback components will still guard).
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
