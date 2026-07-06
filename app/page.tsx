import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-4xl rounded-3xl border border-border bg-card p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Production architecture scaffold
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          BangBang
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          This foundation sets up route groups, shared UI primitives, Tailwind tokens, environment configuration, Supabase wiring, and API scaffolding for the future marketplace experience.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/auth">Open Auth Routes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/home">Open Main App Shell</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
