package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.util.List;

public record AdminQuestionResponse(
        Long id,
        Long quizId,
        String prompt,
        String explanation,
        int position,
        List<AdminOptionResponse> options
) {

    public record AdminOptionResponse(
            Long id,
            String text,
            boolean correct,
            int position
    ) {
    }
}
