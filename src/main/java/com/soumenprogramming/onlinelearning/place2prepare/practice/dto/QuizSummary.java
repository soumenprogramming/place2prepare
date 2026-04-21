package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

public record QuizSummary(
        Long id,
        String title,
        String slug,
        String description,
        int timeLimitMinutes,
        int passingScorePercent,
        int questionCount,
        int attemptCount,
        Integer bestScorePercent,
        Integer lastScorePercent,
        String lastAttemptStatus,
        Long inProgressAttemptId
) {
}
