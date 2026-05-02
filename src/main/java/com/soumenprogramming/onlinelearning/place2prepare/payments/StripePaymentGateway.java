package com.soumenprogramming.onlinelearning.place2prepare.payments;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

/**
 * Stripe-branded scaffold. The real checkout-session and webhook-signature logic is
 * intentionally left as a TODO so it can be dropped in without disrupting the rest of the
 * platform. Activate with {@code app.payments.provider=stripe} AND valid Stripe keys.
 *
 * <p>Until then this bean exists as a placeholder so the wiring is ready the day keys land.</p>
 */
@Component
@ConditionalOnProperty(
        prefix = "app.payments",
        name = "provider",
        havingValue = "stripe"
)
public class StripePaymentGateway implements PaymentGateway {

    public static final String PROVIDER = "stripe";

    private static final Logger log = LoggerFactory.getLogger(StripePaymentGateway.class);

    private final String secretKey;
    private final String webhookSecret;

    public StripePaymentGateway(@Value("${app.payments.stripe.secret-key:}") String secretKey,
                                @Value("${app.payments.stripe.webhook-secret:}") String webhookSecret) {
        this.secretKey = secretKey;
        this.webhookSecret = webhookSecret;
        if (secretKey == null || secretKey.isBlank()) {
            log.warn("StripePaymentGateway activated but app.payments.stripe.secret-key is empty.");
        }
    }

    @Override
    public String provider() {
        return PROVIDER;
    }

    @Override
    public CheckoutSession createCheckout(PaymentOrder order, String successUrl, String cancelUrl) {
        // TODO: call https://api.stripe.com/v1/checkout/sessions with HTTP Basic (secretKey)
        //       and map response { id, url } → CheckoutSession. For now surface a clear error.
        throw new ResponseStatusException(
                SERVICE_UNAVAILABLE,
                "Stripe payments are not wired yet. Configure app.payments.stripe.secret-key "
                        + "and implement the checkout-session call."
        );
    }

    @Override
    public WebhookEvent parseWebhook(String payload, String signatureHeader) {
        // TODO: verify signatureHeader against webhookSecret and pull the order id out of
        //       the event metadata (we set `metadata[order_id]` when creating the session).
        log.warn("Stripe webhook received but verification not implemented. Ignoring.");
        return null;
    }
}
