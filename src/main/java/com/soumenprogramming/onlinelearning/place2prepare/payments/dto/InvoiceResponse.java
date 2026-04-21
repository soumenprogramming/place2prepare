package com.soumenprogramming.onlinelearning.place2prepare.payments.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record InvoiceResponse(
        Long id,
        String invoiceNumber,
        Long courseId,
        String courseTitle,
        String planType,
        BigDecimal amount,
        String currency,
        Instant issuedAt,
        Long orderId
) {
}
