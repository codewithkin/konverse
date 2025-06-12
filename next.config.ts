import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [new URL("https://utfs.io/f/**")],
  },
};

export default nextConfig;
