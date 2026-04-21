import Link from "next/link";
import { GraduationCap } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl bg-white shadow-soft md:grid-cols-2">
        <section className="relative hidden md:flex md:flex-col md:justify-between md:bg-brand-gradient md:p-10">
          <div className="absolute inset-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),_transparent_55%)]" />
          </div>
          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="rounded-xl bg-white/20 p-2 backdrop-blur">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Place2Prepare</span>
          </div>
          <div className="relative z-10 text-white">
            <h2 className="text-3xl font-semibold leading-tight">
              Learn smarter, grow faster.
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/85">
              Access expert-led courses, track progress, and unlock your next
              career milestone with a modern learning experience.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-md animate-fade-in rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>

            <div className="mt-6">{children}</div>

            <p className="mt-6 text-center text-sm text-slate-600">
              {footerText}{" "}
              <Link
                href={footerHref}
                className="font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {footerLinkText}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
