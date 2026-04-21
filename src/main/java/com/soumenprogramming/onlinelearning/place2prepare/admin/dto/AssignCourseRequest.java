package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AssignCourseRequest(
        @NotNull(message = "Course ID is required")
        Long courseId,
        @NotBlank(message = "Plan type is required")
        String planType
) {
}
