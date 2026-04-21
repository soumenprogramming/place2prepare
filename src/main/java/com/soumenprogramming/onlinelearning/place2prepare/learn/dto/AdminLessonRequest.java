package com.soumenprogramming.onlinelearning.place2prepare.learn.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminLessonRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title is too long")
        String title,
        @NotBlank(message = "Slug is required")
        @Size(max = 200, message = "Slug is too long")
        String slug,
        @NotBlank(message = "Content is required")
        String contentMarkdown,
        @Size(max = 500, message = "Video URL is too long")
        String videoUrl,
        @Min(value = 1, message = "Duration should be at least 1 minute")
        @Max(value = 600, message = "Duration too high")
        int durationMinutes,
        Integer position
) {
}
