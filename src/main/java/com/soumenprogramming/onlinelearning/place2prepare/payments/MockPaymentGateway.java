package com.soumenprogramming.onlinelearning.place2prepare.payments;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Default zero-configuration payment gateway used for local development and demos. It never
 * contacts an external service — it just points the browser at a frontend "complete" page
 * that calls the mock-confirm endpoint to flip the order to COMPLETED.
 */
@Component
@ConditionalOnProperty(
        prefix = "app.payments",
        name = "provider",
        havingValue = "mock",
        matchIfMissing = true
)
public class MockPaymentGateway implements PaymentGateway {

    public static final String PROVIDER = "mock";

    private final String frontendBaseUrl;

    public MockPaymentGateway(@Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    public String provider() {
        return PROVIDER;
    }

    @Override
    public CheckoutSession createCheckout(PaymentOrder order, String successUrl, String cancelUrl) {
        String providerOrderId = "mock_" + UUID.randomUUID();
        String redirect = frontendBaseUrl
                + "/payments/complete"
                + "?orderId=" + order.getId()
                + "&providerOrderId=" + URLEncoder.encode(providerOrderId, StandardCharsets.UTF_8)
                + "&amount=" + URLEncoder.encode(order.getAmount().toPlainString(), StandardCharsets.UTF_8)
                + "&currency=" + URLEncoder.encode(order.getCurrency(), StandardCharsets.UTF_8);
        return new CheckoutSession(redirect, providerOrderId);
    }
}
