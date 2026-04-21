package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSubjectRequest(
        @NotBlank(message = "Subject name is required")
        String name,
        @NotBlank(message = "Subject slug is required")
        String slug,
        @NotBlank(message = "Description is required")
        @Size(max = 500, message = "Description too long")
        String description
) {
}
