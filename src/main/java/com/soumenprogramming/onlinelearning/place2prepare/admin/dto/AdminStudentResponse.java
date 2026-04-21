package com.soumenprogramming.onlinelearning.place2prepare.admin.dto;

public record AdminStudentResponse(
        Long id,
        String fullName,
        String email,
        String role
) {
}
