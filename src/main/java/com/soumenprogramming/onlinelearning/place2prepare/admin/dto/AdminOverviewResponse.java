package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

public record AdminOverviewResponse(
        long totalStudents,
        long totalAdmins,
        long totalSubjects,
        long totalCourses,
        long totalEnrollments
) {
}
