/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // Lets a phone on your Wi-Fi load the dev server (Next blocks other hosts by
  // default). Uses the host from SITE_URL in .env.local — dev only, ignored in production.
  allowedDevOrigins: process.env.SITE_URL ? [new URL(process.env.SITE_URL).hostname] : [],
};

export default nextConfig;
