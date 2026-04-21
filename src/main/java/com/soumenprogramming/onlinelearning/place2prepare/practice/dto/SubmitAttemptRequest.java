package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import java.util.List;

public record SubmitAttemptRequest(List<AnswerPayload> answers) {

    public record AnswerPayload(Long questionId, Long optionId) {
    }
}
