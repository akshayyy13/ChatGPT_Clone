// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },

      { protocol: "https", hostname: "res.cloudinary.com", pathname: "**" },
    ],
  },
  // typescript: {
  //   // !! WARN !!
  //   // Dangerously allow production builds to successfully complete even if
  //   // your project has TypeScript errors.
  //   // !! WARN !!
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   // Warning: This allows production builds to successfully complete
  //   // even if your project has ESLint errors
  //   ignoreDuringBuilds: true,
  // },
};
export default nextConfig;
