package com.soumenprogramming.onlinelearning.place2prepare.course.dto;

public record CourseResponse(
        Long id,
        String title,
        String slug,
        String description,
        String difficulty,
        int durationHours,
        String subject,
        boolean premium
) {
}
