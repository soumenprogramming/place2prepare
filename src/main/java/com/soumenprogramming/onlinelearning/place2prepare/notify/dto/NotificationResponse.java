package com.soumenprogramming.onlinelearning.place2prepare.notify.dto;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String type,
        String title,
        String message,
        String link,
        boolean read,
        Instant createdAt
) {
}
