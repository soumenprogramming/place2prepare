package com.soumenprogramming.onlinelearning.place2prepare.dashboard.dto;

public record EnrolledCourseDto(
        Long enrollmentId,
        Long courseId,
        String title,
        int progress,
        int lessonsLeft,
        String planType,
        String status
) {
}
