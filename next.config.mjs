/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Log outgoing fetch() during SSR / RSC in the terminal (`next dev` / `next build` output).
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
