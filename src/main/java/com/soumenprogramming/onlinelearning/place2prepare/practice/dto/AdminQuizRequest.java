package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record AdminQuizRequest(
        @NotBlank String title,
        @NotBlank String slug,
        @NotBlank String description,
        @Min(1) @Max(600) int timeLimitMinutes,
        @Min(0) @Max(100) int passingScorePercent,
        Boolean published
) {
}
