package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.time.Instant;
import java.util.List;

public record AdminQuizResponse(
        Long id,
        Long courseId,
        String courseTitle,
        String title,
        String slug,
        String description,
        int timeLimitMinutes,
        int passingScorePercent,
        boolean published,
        int questionCount,
        Instant createdAt,
        Instant updatedAt,
        List<AdminQuestionResponse> questions
) {
}
