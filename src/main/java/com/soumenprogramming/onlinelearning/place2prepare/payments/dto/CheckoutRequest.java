package com.soumenprogramming.onlinelearning.place2prepare.payments.dto;

import jakarta.validation.constraints.NotNull;

public record CheckoutRequest(
        @NotNull Long courseId
) {
}
