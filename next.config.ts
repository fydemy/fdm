import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/review/workspace",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/dashboard/review/workspace/:path*",
        destination: "/workspace/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/mentor/workspace",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/dashboard/mentor/workspace/:path*",
        destination: "/workspace/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/review/launches",
        destination: "/launches",
        permanent: true,
      },
      {
        source: "/workspace/f/:id",
        destination: "/workspace/:id",
        permanent: true,
      },
      {
        source: "/dashboard/review/workspace/f/:id",
        destination: "/workspace/:id",
        permanent: true,
      },
      {
        source: "/dashboard/mentor/workspace/f/:id",
        destination: "/workspace/:id",
        permanent: true,
      },
      {
        source: "/dashboard/apply",
        destination: "/apply",
        permanent: true,
      },
      {
        source: "/dashboard/apply/:path*",
        destination: "/apply/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/launches",
        destination: "/launches",
        permanent: true,
      },
      {
        source: "/dashboard/launches/:path*",
        destination: "/launches/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/workspace",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/dashboard/workspace/:path*",
        destination: "/workspace/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/materials",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/dashboard/materials/:path*",
        destination: "/workspace/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/review/materials",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/dashboard/review/materials/:path*",
        destination: "/workspace/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/mentor/materials",
        destination: "/workspace",
        permanent: true,
      },
      {
        source: "/dashboard/mentor/materials/:path*",
        destination: "/workspace/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
