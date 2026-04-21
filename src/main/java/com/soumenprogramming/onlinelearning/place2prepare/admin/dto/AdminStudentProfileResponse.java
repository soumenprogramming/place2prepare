package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

import java.util.List;

public record AdminStudentProfileResponse(
        Long id,
        String fullName,
        String email,
        String role,
        long totalCourses,
        List<StudentEnrollmentResponse> enrolledCourses
) {
}
