import type { ReactNode } from "react";
import MainNav from "@/components/layouts/MainNav";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <MainNav />
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">{children}</main>
    </div>
  );
}
