package com.soumenprogramming.onlinelearning.place2prepare.practice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record AdminQuestionRequest(
        @NotBlank String prompt,
        String explanation,
        Integer position,
        @NotEmpty @Size(min = 2, max = 8) @Valid List<AdminOptionRequest> options
) {

    public record AdminOptionRequest(
            @NotBlank String text,
            boolean correct,
            Integer position
    ) {
    }
}
