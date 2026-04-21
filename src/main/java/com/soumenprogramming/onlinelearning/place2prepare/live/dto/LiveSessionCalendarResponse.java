package com.soumenprogramming.onlinelearning.place2prepare.live.dto;

import java.util.List;

public record LiveSessionCalendarResponse(
        List<LiveSessionResponse> upcoming,
        List<LiveSessionResponse> past
) {
}
