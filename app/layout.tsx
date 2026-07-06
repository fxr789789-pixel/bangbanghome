import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BangBang | AI-first local services marketplace",
  description:
    "A scalable architecture foundation for BangBang's local services marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}