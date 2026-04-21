package com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto;

import java.time.Instant;

public record ScheduleItemDto(
        Long id,
        String title,
        String time,
        Instant scheduledAt,
        int durationMinutes,
        String status,
        Long courseId,
        String courseTitle,
        String joinUrl,
        boolean joinable
) {
}
