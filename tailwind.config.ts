import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14213d",
        mint: "#13b889",
        coral: "#ef6f6c",
        amber: "#f3b23c",
        paper: "#f8faf8"
      },
      boxShadow: {
        soft: "0 12px 36px rgba(20, 33, 61, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
