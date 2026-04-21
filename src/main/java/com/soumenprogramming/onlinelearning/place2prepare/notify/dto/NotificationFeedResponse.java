package com.soumenprogramming.onlinelearning.place2prepare.notify.dto;

import java.util.List;

public record NotificationFeedResponse(
        long unreadCount,
        List<NotificationResponse> items
) {
}
