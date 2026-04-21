package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCourseRequest(
        @NotBlank(message = "Course title is required")
        String title,
        @NotBlank(message = "Course slug is required")
        String slug,
        @NotBlank(message = "Description is required")
        @Size(max = 1000, message = "Description too long")
        String description,
        @NotBlank(message = "Difficulty is required")
        String difficulty,
        @Min(value = 1, message = "Duration should be at least 1 hour")
        @Max(value = 500, message = "Duration too high")
        int durationHours,
        @NotNull(message = "Subject ID is required")
        Long subjectId,
        Boolean premium
) {
}
