import Link from "next/link";
import Image from "next/image";
import { GraduationCap, CheckCircle2 } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
};

const SIDE_FEATURES = [
  "Structured weekly learning tracks",
  "Live mock interviews with real engineers",
  "Progress tracking across all subjects",
  "No subscriptions — pay once per course",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerHref,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden app-shell-bg p-4 md:p-6">
      <div className="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-soft md:grid-cols-2">
        {/* Left: brand panel */}
        <section className="relative hidden overflow-hidden bg-slate-950 md:flex md:flex-col md:justify-between md:p-10">
          <Image
            src="/hero-study-session.png"
            alt="Students preparing together"
            fill
            sizes="50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 page-hero-overlay" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Place2Prepare</span>
          </div>

          {/* Bottom copy */}
          <div className="relative z-10 text-white">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
              Prepare with focus,
              <br />
              interview with confidence.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
              Sign in to continue your placement roadmap, live sessions, and
              mentor-reviewed practice.
            </p>
            <ul className="mt-6 space-y-2.5">
              {SIDE_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-2.5 text-sm text-white/90">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Right: form */}
        <section className="flex items-center justify-center bg-white p-5 md:p-10">
          <div className="w-full max-w-md animate-fade-in">
            {/* Mobile logo */}
            <div className="mb-6 flex items-center gap-2.5 md:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient shadow-glow-sm">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Place2Prepare</span>
            </div>

            <div className="rounded-2xl panel-surface p-6 md:p-8">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>

              <div className="mt-6">{children}</div>

              <p className="mt-6 text-center text-sm text-slate-600">
                {footerText}{" "}
                <Link
                  href={footerHref}
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline underline-offset-2"
                >
                  {footerLinkText}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
