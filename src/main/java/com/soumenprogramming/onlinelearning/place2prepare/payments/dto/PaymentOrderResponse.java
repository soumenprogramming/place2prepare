package com.soumenprogramming.onlinelearning.place2prepare.payments.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record PaymentOrderResponse(
        Long id,
        Long courseId,
        String courseTitle,
        String planType,
        BigDecimal amount,
        String currency,
        String status,
        String provider,
        String providerOrderId,
        String checkoutUrl,
        String failureReason,
        Instant createdAt,
        Instant completedAt
) {
}
