import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname);
    return config;
  },

  // Silence Turbopack error
  turbopack: {
    // empty config = allowed
  },

  allowedDevOrigins: ["192.168.1.4"],

};

export default nextConfig;
