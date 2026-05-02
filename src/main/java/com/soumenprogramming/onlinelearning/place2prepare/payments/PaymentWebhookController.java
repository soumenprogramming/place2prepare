package com.soumenprogramming.onlinelearning.place2prepare.payments;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public endpoint so payment providers (Stripe, Razorpay, ...) can deliver webhooks without
 * authenticating. Safe to expose: the payload signature is the only trust boundary, verified
 * by the active {@link PaymentGateway}.
 */
@RestController
@RequestMapping("/api/v1/public/payments")
public class PaymentWebhookController {

    private final PaymentsService paymentsService;

    public PaymentWebhookController(PaymentsService paymentsService) {
        this.paymentsService = paymentsService;
    }

    @PostMapping("/webhook/{provider}")
    public ResponseEntity<Map<String, String>> webhook(
            @PathVariable String provider,
            @RequestHeader(name = "X-Payment-Signature", required = false) String signature,
            @RequestBody(required = false) String payload
    ) {
        paymentsService.handleWebhook(provider, payload == null ? "" : payload, signature);
        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
