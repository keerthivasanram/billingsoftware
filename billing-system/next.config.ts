import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io", "*.ngrok.app", "*.ngrok-free.dev", "*.loca.lt"],
};

export default nextConfig;
