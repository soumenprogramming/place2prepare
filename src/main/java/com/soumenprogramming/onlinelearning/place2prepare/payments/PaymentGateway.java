package com.soumenprogramming.onlinelearning.place2prepare.payments;

/**
 * Strategy contract for a payment provider (Stripe, Razorpay, Mock, …).
 *
 * <p>The app picks the active gateway at startup via
 * {@code app.payments.provider} (default {@code mock}). Each provider is a Spring bean
 * annotated with {@code @ConditionalOnProperty} matching its provider id.</p>
 */
public interface PaymentGateway {

    /**
     * Short identifier used in webhook URLs and persisted on orders (e.g. "mock", "stripe").
     */
    String provider();

    /**
     * Open a checkout session for the given (PENDING) order. Implementations should update
     * the order with any provider-specific ids (provider order id, checkout url) and return
     * the URL the user should be redirected to.
     */
    CheckoutSession createCheckout(PaymentOrder order, String successUrl, String cancelUrl);

    /**
     * Parse a webhook payload into the order id we should mark as completed.
     * Returning {@code null} means the webhook was unrelated or not valid.
     */
    default WebhookEvent parseWebhook(String payload, String signatureHeader) {
        return null;
    }

    record CheckoutSession(String redirectUrl, String providerOrderId) {
    }

    record WebhookEvent(Long orderId, PaymentStatus resolvedStatus, String providerOrderId) {
    }
}
