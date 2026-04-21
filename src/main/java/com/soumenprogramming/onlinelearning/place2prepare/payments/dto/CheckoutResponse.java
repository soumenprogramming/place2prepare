package com.soumenprogramming.onlinelearning.place2prepare.payments.dto;

import java.math.BigDecimal;

public record CheckoutResponse(
        Long orderId,
        String provider,
        String providerOrderId,
        String checkoutUrl,
        BigDecimal amount,
        String currency,
        String courseTitle,
        String planType
) {
}
