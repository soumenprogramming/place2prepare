"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));
    setRole(localStorage.getItem("userRole"));
    setReady(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "border-b border-slate-200/70 bg-white/85 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl"
            : "border-b border-slate-200/40 bg-white/70 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6 md:py-4">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-sm transition-transform duration-200 group-hover:scale-105">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-[17px] font-bold tracking-tight text-slate-900">
              Place2Prepare
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Primary"
            className="hidden items-center gap-0.5 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-1 md:flex"
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
                  className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                    active
                      ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-2 md:flex">
            {ready && isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.98]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="btn-glow rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:brightness-110 active:scale-[0.98]"
                >
                  Try for free
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <nav className="absolute left-0 right-0 top-[61px] animate-fade-in border-b border-slate-200 bg-white/95 px-4 pb-6 pt-4 shadow-xl backdrop-blur-xl">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
              {ready && isLoggedIn ? (
                <>
                  <Link
                    href={dashboardHref}
                    className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center rounded-xl bg-brand-gradient px-4 py-3 text-sm font-semibold text-white shadow-glow-sm"
                  >
                    Try for free
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
