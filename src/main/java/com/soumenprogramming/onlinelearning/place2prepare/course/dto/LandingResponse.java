package com.soumenprogramming.onlinelearning.place2prepare.course.dto;

import java.util.List;

public record LandingResponse(
        long totalStudents,
        long totalCourses,
        long totalEnrollments,
        List<String> topSubjects
) {
}
