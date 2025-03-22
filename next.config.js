/** @type {import('next').NextConfig} */

const nextConfig = {
  /* config options here */

  images: {
    domains: ["placehold.co"],

    dangerouslyAllowSVG: true,

    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
