import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10 sm:px-8 lg:px-10">
        {children}
      </div>
    </div>
  );
}
