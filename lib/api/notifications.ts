import { apiRequest } from "./client";

export type NotificationType =
  | "COURSE_ASSIGNED"
  | "COURSE_REMOVED"
  | "LIVE_SESSION_SCHEDULED"
  | "LIVE_SESSION_UPDATED"
  | "LIVE_SESSION_CANCELLED"
  | "LIVE_SESSION_REMINDER"
  | "PASSWORD_RESET"
  | "SYSTEM";

export type NotificationItem = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export type NotificationFeed = {
  unreadCount: number;
  items: NotificationItem[];
};

export function getNotifications(token: string, limit = 20) {
  return apiRequest<NotificationFeed>(
    `/api/v1/notifications?limit=${limit}`,
    { token }
  );
}

export function getUnreadCount(token: string) {
  return apiRequest<{ unreadCount: number }>(
    "/api/v1/notifications/unread-count",
    { token }
  );
}

export function markNotificationRead(token: string, id: number) {
  return apiRequest<void>(`/api/v1/notifications/${id}/read`, {
    method: "POST",
    token,
  });
}

export function markAllNotificationsRead(token: string) {
  return apiRequest<{ updated: number }>(
    "/api/v1/notifications/read-all",
    { method: "POST", token }
  );
}
