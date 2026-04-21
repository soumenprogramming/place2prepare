package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.util.List;

public record QuizListResponse(
        Long courseId,
        String courseTitle,
        int totalQuizzes,
        List<QuizSummary> quizzes
) {
}
