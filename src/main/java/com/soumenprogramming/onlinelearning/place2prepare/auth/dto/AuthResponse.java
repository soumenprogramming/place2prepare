package com.soumenprogramming.onlinelearning.place2prepare.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        String role
) {
}
