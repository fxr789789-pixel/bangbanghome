import Link from "next/link";

const navItems = [
  { href: "/home", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/search", label: "Search" },
  { href: "/publish", label: "Publish" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Profile" },
  { href: "/provider-center", label: "Provider Center" }
];

export default function MainNav() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          帮帮
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
