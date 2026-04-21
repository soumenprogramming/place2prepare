package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.time.Instant;

public record AttemptHistoryItem(
        Long attemptId,
        String status,
        Instant startedAt,
        Instant submittedAt,
        int totalQuestions,
        int correctAnswers,
        int scorePercent,
        boolean passed
) {
}
