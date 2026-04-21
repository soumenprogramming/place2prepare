package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

public record StudentEnrollmentResponse(
        Long enrollmentId,
        Long courseId,
        String courseTitle,
        String subject,
        int progress,
        int lessonsLeft,
        String planType,
        String status
) {
}
