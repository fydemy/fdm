import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { siteConfig } from "@/lib/seo";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";

export default async function Image() {
  const bytes = await readFile(join(process.cwd(), "public/logo/fav.jpeg"));
  const src = `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <img
          src={src}
          width={1200}
          height={630}
          alt={siteConfig.name}
          style={{ objectFit: "cover" }}
        />
      </div>
    ),
    { ...size },
  );
}
