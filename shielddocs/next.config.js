/** @type {import('next').NextConfig} */
const nextConfig = {
  // The 'appDir' key has been completely removed.

  images: {
    domains: ["localhost", "lh3.googleusercontent.com", "avatars.githubusercontent.com"],
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    BACKEND_URL: process.env.BACKEND_URL || "http://localhost:8000",
  },
};

module.exports = nextConfig;