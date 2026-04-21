package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.util.List;

public record AttemptQuestionView(
        Long id,
        String prompt,
        int position,
        String explanation,
        Boolean correct,
        List<AttemptOptionView> options
) {
}
