import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "帮帮",
    short_name: "帮帮",
    description: "有事找帮帮 - C2C 本地上门服务交易平台",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf8",
    theme_color: "#14213d",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      },
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable"
      }
    ]
  };
}
