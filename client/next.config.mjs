/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VITE_API_URL: process.env.VITE_API_URL,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
