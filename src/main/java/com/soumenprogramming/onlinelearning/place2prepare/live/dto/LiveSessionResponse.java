package com.soumenprogramming.onlinelearning.place2prepare.live.dto;

import java.time.Instant;

public record LiveSessionResponse(
        Long id,
        String title,
        String description,
        String instructorName,
        Long courseId,
        String courseTitle,
        Instant scheduledAt,
        int durationMinutes,
        String status,
        String joinUrl,
        boolean joinable,
        String accessReason
) {
}
