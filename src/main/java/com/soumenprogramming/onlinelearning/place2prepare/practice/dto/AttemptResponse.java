package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.time.Instant;
import java.util.List;

public record AttemptResponse(
        Long attemptId,
        Long quizId,
        String quizTitle,
        Long courseId,
        String courseTitle,
        String status,
        Instant startedAt,
        Instant submittedAt,
        int timeLimitMinutes,
        int totalQuestions,
        int correctAnswers,
        int scorePercent,
        int passingScorePercent,
        boolean passed,
        List<AttemptQuestionView> questions
) {
}
