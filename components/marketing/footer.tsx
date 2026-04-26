import Link from "next/link";
import { GraduationCap, Mail, ArrowUpRight } from "lucide-react";

const FOOTER_COLUMNS: {
  title: string;
  links: { href: string; label: string }[];
}[] = [
  {
    title: "Product",
    links: [
      { href: "/courses", label: "Courses" },
      { href: "/pricing", label: "Pricing" },
      { href: "/live", label: "Live sessions" },
      { href: "/billing", label: "Billing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/testimonials", label: "Testimonials" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/register", label: "Create account" },
      { href: "/login", label: "Log in" },
      { href: "/forgot-password", label: "Reset password" },
      { href: "/admin-register", label: "Admin access" },
    ],
  },
];

export function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-slate-800/50 bg-slate-950">
      {/* Subtle gradient top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-40" />

      {/* Background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-20 h-80 w-80 rounded-full bg-purple-600/8 blur-3xl" />

      <div className="relative mx-auto max-w-[1280px] px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-sm transition-transform duration-200 group-hover:scale-105">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-[17px] font-bold text-white">
                Place2Prepare
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Placement preparation built around how companies actually
              interview — structured tracks, live mocks, and honest feedback.
            </p>
            <a
              href="mailto:hello@place2prepare.com"
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-slate-800 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5 text-indigo-400" />
              hello@place2prepare.com
            </a>
          </div>

          {/* Link columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-500">
            © {year}{" "}
            <span className="text-slate-400">Place2Prepare</span>
            {" "}· Crafted for job-ready engineers.
          </p>
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span className="text-xs text-slate-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
