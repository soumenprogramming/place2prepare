package com.soumenprogramming.onlinelearning.place2prepare.payments.dto;

import java.math.BigDecimal;
import java.util.List;

public record BillingSummaryResponse(
        String provider,
        boolean enabled,
        BigDecimal premiumPrice,
        String currency,
        List<PaymentOrderResponse> orders,
        List<InvoiceResponse> invoices
) {
}
