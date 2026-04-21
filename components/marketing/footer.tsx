import Link from "next/link";

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
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="h-8 w-8 rounded-lg bg-brand-gradient"
                aria-hidden
              />
              <span className="text-lg font-bold text-white">Place2Prepare</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-400">
              Placement preparation built around how companies actually
              interview — structured tracks, live mocks, and honest feedback.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-200 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-400">
          <p>© {year} Place2Prepare. Crafted for job-ready engineers.</p>
          <p>
            Questions?{" "}
            <a
              href="mailto:hello@place2prepare.com"
              className="text-slate-200 underline-offset-2 hover:underline"
            >
              hello@place2prepare.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
