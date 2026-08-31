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
      {
        source: "/dashboard/launches",
        destination: "/",
        permanent: true,
      },
      {
        source: "/dashboard/launches/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/launches",
        destination: "/",
        permanent: true,
      },
      {
        source: "/launches/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/apply",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/apply/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/review",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/dashboard/review/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/mentor",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/dashboard/mentor/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/partner",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/dashboard/partner/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/app",
        permanent: true,
      },
      {
        source: "/dashboard/:path*",
        destination: "/app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
