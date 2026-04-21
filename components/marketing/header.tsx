"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutUser } from "@/lib/api/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export function MarketingHeader() {
  const pathname = usePathname() ?? "/";
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));
    setRole(localStorage.getItem("userRole"));
    setReady(true);
  }, []);

  async function handleLogout() {
    const token = localStorage.getItem("accessToken") ?? undefined;
    try {
      await logoutUser(token);
    } catch {
      // ignore; we still clear local state
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      setIsLoggedIn(false);
      setRole(null);
      window.location.href = "/login";
    }
  }

  const dashboardHref = role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-brand-gradient" aria-hidden />
          <span className="text-lg font-bold text-slate-900">Place2Prepare</span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-primary ${
                  active ? "text-slate-900 font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {ready && isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
              >
                Try for free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
