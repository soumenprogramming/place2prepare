import { apiRequest } from "./client";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type PaymentOrder = {
  id: number;
  courseId: number;
  courseTitle: string;
  planType: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerOrderId: string | null;
  checkoutUrl: string | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type Invoice = {
  id: number;
  invoiceNumber: string;
  courseId: number;
  courseTitle: string;
  planType: string;
  amount: string;
  currency: string;
  issuedAt: string;
  orderId: number;
};

export type BillingSummary = {
  provider: string;
  enabled: boolean;
  premiumPrice: string;
  currency: string;
  orders: PaymentOrder[];
  invoices: Invoice[];
};

export type CheckoutResponse = {
  orderId: number;
  provider: string;
  providerOrderId: string;
  checkoutUrl: string;
  amount: string;
  currency: string;
  courseTitle: string;
  planType: string;
};

export function getBillingSummary(token: string) {
  return apiRequest<BillingSummary>("/api/v1/payments/summary", { token });
}

export function startCheckout(token: string, courseId: number) {
  return apiRequest<CheckoutResponse>("/api/v1/payments/checkout", {
    method: "POST",
    token,
    body: { courseId },
  });
}

export function confirmMockOrder(token: string, orderId: number) {
  return apiRequest<PaymentOrder>(
    `/api/v1/payments/orders/${orderId}/mock-confirm`,
    { method: "POST", token }
  );
}

export function cancelPendingOrder(token: string, orderId: number) {
  return apiRequest<PaymentOrder>(
    `/api/v1/payments/orders/${orderId}/cancel`,
    { method: "POST", token }
  );
}

export function downgradeCourse(token: string, courseId: number) {
  return apiRequest<{ message: string }>(
    `/api/v1/payments/courses/${courseId}/downgrade`,
    { method: "POST", token }
  );
}

export function getInvoice(token: string, invoiceId: number) {
  return apiRequest<Invoice>(`/api/v1/payments/invoices/${invoiceId}`, {
    token,
  });
}
