package com.soumenprogramming.onlinelearning.place2prepare.live.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AdminLiveSessionRequest(
        @NotBlank String title,
        String description,
        String instructorName,
        Long courseId,
        @NotNull Instant scheduledAt,
        @Min(5) @Max(600) int durationMinutes,
        String joinUrl,
        String status
) {
}
