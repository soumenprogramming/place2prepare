"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Receipt,
  Sparkles,
  XCircle,
} from "lucide-react";
import { extractErrorMessage } from "@/lib/api/client";
import {
  cancelPendingOrder,
  downgradeCourse,
  getBillingSummary,
  type BillingSummary,
  type Invoice,
  type PaymentOrder,
  type PaymentStatus,
} from "@/lib/api/payments";
import { clearSession, getSession } from "@/lib/auth/session";

type LoadState = "checking" | "loading" | "ready" | "error";

function formatMoney(amount: string, currency: string): string {
  const num = Number.parseFloat(amount);
  if (Number.isNaN(num)) return `${currency} ${amount}`;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}

function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const palette: Record<PaymentStatus, string> = {
    PENDING: "bg-amber-100 text-amber-800 border-amber-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    FAILED: "bg-rose-100 text-rose-700 border-rose-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const Icon =
    status === "COMPLETED"
      ? CheckCircle2
      : status === "PENDING"
      ? Clock3
      : XCircle;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${palette[status]}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function printInvoice(invoice: Invoice, providerName: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${invoice.invoiceNumber}</title>
<style>
body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;max-width:720px;margin:40px auto;padding:0 24px}
h1{font-size:24px;margin:0 0 8px}
.muted{color:#64748b}
.box{border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-top:24px}
table{width:100%;border-collapse:collapse;margin-top:16px}
td,th{padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:left}
.total{font-weight:700;font-size:18px;margin-top:24px;text-align:right}
.badge{display:inline-block;padding:3px 8px;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:12px;font-weight:600}
</style></head><body>
<h1>Place2Prepare Invoice</h1>
<p class="muted">Invoice ${invoice.invoiceNumber} · issued ${new Date(invoice.issuedAt).toLocaleString()}</p>
<div class="box">
  <p><span class="badge">${invoice.planType}</span></p>
  <table>
    <tbody>
      <tr><th>Course</th><td>${invoice.courseTitle}</td></tr>
      <tr><th>Plan</th><td>${invoice.planType}</td></tr>
      <tr><th>Order ID</th><td>#${invoice.orderId}</td></tr>
      <tr><th>Provider</th><td>${providerName}</td></tr>
      <tr><th>Amount</th><td>${formatMoney(invoice.amount, invoice.currency)}</td></tr>
    </tbody>
  </table>
  <p class="total">Total paid: ${formatMoney(invoice.amount, invoice.currency)}</p>
</div>
<p class="muted" style="margin-top:32px">Thank you for choosing Place2Prepare. Use your browser's Print dialog to save this as PDF.</p>
</body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

export default function BillingPage() {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("checking");
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [error, setError] = useState("");
  const [working, setWorking] = useState<number | null>(null);
  const [sessionToken, setSessionToken] = useState("");

  const load = useCallback(async (token: string) => {
    try {
      const data = await getBillingSummary(token);
      setSummary(data);
      setLoadState("ready");
      setError("");
    } catch (err) {
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status?: number }).status)
          : undefined;
      if (status === 401 || status === 403) {
        clearSession();
        router.replace("/login?redirect=/billing");
        return;
      }
      setError(extractErrorMessage(err, "Couldn't load your billing summary."));
      setLoadState("error");
    }
  }, [router]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/login?redirect=/billing");
      return;
    }
    setSessionToken(session.token);
    setLoadState("loading");
    load(session.token);
  }, [router, load]);

  async function handleCancel(order: PaymentOrder) {
    if (!sessionToken) return;
    setWorking(order.id);
    try {
      await cancelPendingOrder(sessionToken, order.id);
      await load(sessionToken);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't cancel this order."));
    } finally {
      setWorking(null);
    }
  }

  async function handleDowngrade(courseId: number) {
    if (!sessionToken) return;
    setWorking(courseId + 1_000_000);
    try {
      await downgradeCourse(sessionToken, courseId);
      await load(sessionToken);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't downgrade this course."));
    } finally {
      setWorking(null);
    }
  }

  if (loadState === "checking" || loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">
        Loading your billing history...
      </main>
    );
  }

  const orders = summary?.orders ?? [];
  const invoices = summary?.invoices ?? [];
  const provider = summary?.provider ?? "mock";
  const enabled = summary?.enabled ?? false;

  const premiumCourses = new Set(
    orders
      .filter((o) => o.status === "COMPLETED" && o.planType === "PREMIUM")
      .map((o) => o.courseId)
  );

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl bg-brand-gradient p-6 text-white shadow-soft md:p-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/85 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
          <h1 className="mt-3 text-3xl font-bold">Billing & invoices</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Manage your Premium upgrades, download invoices, and review past
            payments.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/90">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1">
              <CreditCard className="h-3.5 w-3.5" />
              Provider: <span className="font-semibold">{provider}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              Premium price: {summary ? formatMoney(summary.premiumPrice, summary.currency) : "—"}
            </span>
            {!enabled ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-100/20 px-3 py-1">
                Self-serve payments disabled
              </span>
            ) : null}
          </div>
        </header>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Orders</h2>
            <span className="text-xs text-slate-500">{orders.length} total</span>
          </div>
          {orders.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No orders yet. Upgrade an enrolled course to Premium from its
              course page.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {orders.map((order) => {
                const premium = premiumCourses.has(order.courseId);
                const canDowngrade =
                  order.status === "COMPLETED" && premium;
                return (
                  <li key={order.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {order.courseTitle}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          #{order.id} ·{" "}
                          {formatMoney(order.amount, order.currency)} ·{" "}
                          {order.provider} · {formatWhen(order.createdAt)}
                        </p>
                        {order.failureReason ? (
                          <p className="mt-1 text-xs text-rose-600">
                            {order.failureReason}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={order.status} />
                        {order.status === "PENDING" && order.checkoutUrl ? (
                          <Link
                            href={order.checkoutUrl}
                            className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            Resume checkout
                          </Link>
                        ) : null}
                        {order.status === "PENDING" ? (
                          <button
                            type="button"
                            onClick={() => handleCancel(order)}
                            disabled={working === order.id}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        ) : null}
                        {canDowngrade ? (
                          <button
                            type="button"
                            onClick={() => handleDowngrade(order.courseId)}
                            disabled={working === order.courseId + 1_000_000}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            Downgrade to Basic
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Invoices
            </h2>
            <span className="text-xs text-slate-500">
              {invoices.length} issued
            </span>
          </div>
          {invoices.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              Completed payments will produce invoices here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {invoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-slate-700">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {invoice.courseTitle}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatMoney(invoice.amount, invoice.currency)} ·{" "}
                      {invoice.planType} · {formatWhen(invoice.issuedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => printInvoice(invoice, provider)}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
