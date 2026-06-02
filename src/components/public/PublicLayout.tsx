import { Link, useRouterState } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/writing", label: "Writing" },
  { to: "/topics", label: "Topics" },
  { to: "/books", label: "Books" },
  { to: "/podcast", label: "Podcast" },
  { to: "/about", label: "About" },
] as const;

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0A0F1E]">
      <header className="sticky top-0 z-50 border-b border-[rgba(10,15,30,0.08)] bg-[#FAFAF8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="font-serif text-lg font-bold tracking-tight text-[#1B4D3E] no-underline">
            Prasanth Raju
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-medium no-underline transition ${
                  pathname === item.to || (item.to !== "/" && pathname.startsWith(item.to))
                    ? "text-[#E8522A]"
                    : "text-[#6B7385] hover:text-[#0A0F1E]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/classic"
            className="hidden text-xs font-medium text-[#6B7385] no-underline hover:text-[#0A0F1E] sm:inline"
          >
            Full site
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
      <footer className="border-t border-[rgba(10,15,30,0.08)] py-8 text-center text-xs text-[#6B7385]">
        © {new Date().getFullYear()} Prasanth Raju · Advocate &amp; Counsel
      </footer>
    </div>
  );
}
