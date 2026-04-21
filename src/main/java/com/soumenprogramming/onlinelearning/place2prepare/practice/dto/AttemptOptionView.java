package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

/**
 * Option shown to the student during an attempt or when reviewing a submitted attempt.
 *
 * During IN_PROGRESS attempts, {@code correct} and {@code selected} are always null / false
 * so the UI cannot leak answers. Once submitted, both are populated for the review view.
 */
public record AttemptOptionView(
        Long id,
        String text,
        int position,
        Boolean correct,
        boolean selected
) {
}
