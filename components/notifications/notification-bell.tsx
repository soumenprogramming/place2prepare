"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  Check,
  CheckCheck,
  Info,
  KeyRound,
  UserMinus,
  Video,
  XCircle,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationFeed,
  type NotificationItem,
  type NotificationType,
} from "@/lib/api/notifications";

const REFRESH_INTERVAL_MS = 45_000;

function TypeIcon({ type }: { type: NotificationType }) {
  const base = "h-4 w-4";
  switch (type) {
    case "COURSE_ASSIGNED":
      return <BookOpen className={`${base} text-emerald-600`} />;
    case "COURSE_REMOVED":
      return <UserMinus className={`${base} text-rose-600`} />;
    case "LIVE_SESSION_SCHEDULED":
    case "LIVE_SESSION_UPDATED":
    case "LIVE_SESSION_REMINDER":
      return <Video className={`${base} text-indigo-600`} />;
    case "LIVE_SESSION_CANCELLED":
      return <XCircle className={`${base} text-amber-600`} />;
    case "PASSWORD_RESET":
      return <KeyRound className={`${base} text-indigo-600`} />;
    default:
      return <Info className={`${base} text-slate-500`} />;
  }
}

function relativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function NotificationBell({
  token,
  tone = "dark",
}: {
  token: string;
  tone?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const [feed, setFeed] = useState<NotificationFeed>({
    unreadCount: 0,
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const response = await getNotifications(token, 20);
      setFeed(response);
      setError("");
    } catch (err) {
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status?: number }).status)
          : undefined;
      if (status === 401 || status === 403) return;
      setError("Unable to load notifications.");
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
    const id = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function handleMarkOne(item: NotificationItem) {
    if (item.read) return;
    try {
      setActioningId(item.id);
      await markNotificationRead(token, item.id);
      setFeed((prev) => ({
        unreadCount: Math.max(0, prev.unreadCount - 1),
        items: prev.items.map((n) =>
          n.id === item.id ? { ...n, read: true } : n
        ),
      }));
    } catch {
      setError("Couldn't mark as read.");
    } finally {
      setActioningId(null);
    }
  }

  async function handleMarkAll() {
    if (feed.unreadCount === 0) return;
    try {
      setMarkingAll(true);
      await markAllNotificationsRead(token);
      setFeed((prev) => ({
        unreadCount: 0,
        items: prev.items.map((n) => ({ ...n, read: true })),
      }));
    } catch {
      setError("Couldn't mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  }

  const buttonColor =
    tone === "dark"
      ? "border-white/40 bg-white/10 text-white hover:bg-white/20"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`relative inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition ${buttonColor}`}
        aria-label="Open notifications"
      >
        <Bell className="h-4 w-4" />
        Alerts
        {feed.unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {feed.unreadCount > 99 ? "99+" : feed.unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[360px] max-w-[92vw] rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-xl ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Notifications</p>
              <p className="text-[11px] text-slate-500">
                {feed.unreadCount > 0
                  ? `${feed.unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={markingAll || feed.unreadCount === 0}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          </div>

          {error ? (
            <p className="px-4 py-2 text-xs text-rose-600">{error}</p>
          ) : null}

          <div className="max-h-[420px] overflow-y-auto">
            {loading && feed.items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">
                Loading...
              </p>
            ) : feed.items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {feed.items.map((item) => {
                  const Wrapper: React.ElementType = item.link ? Link : "div";
                  const wrapperProps: Record<string, unknown> = item.link
                    ? { href: item.link, onClick: () => setOpen(false) }
                    : {};
                  return (
                    <li
                      key={item.id}
                      className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${
                        item.read ? "" : "bg-indigo-50/40"
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <TypeIcon type={item.type} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Wrapper
                          {...wrapperProps}
                          className="block text-left"
                        >
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                            {item.message}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {relativeTime(item.createdAt)}
                          </p>
                        </Wrapper>
                      </div>
                      {!item.read ? (
                        <button
                          type="button"
                          onClick={() => handleMarkOne(item)}
                          disabled={actioningId === item.id}
                          className="h-6 w-6 flex-shrink-0 rounded-full border border-indigo-200 text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="m-auto h-3 w-3" />
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
