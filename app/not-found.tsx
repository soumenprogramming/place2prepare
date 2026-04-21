import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        404
      </p>
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="max-w-md text-slate-600">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow hover:brightness-110"
      >
        Go home
      </Link>
    </main>
  );
}
