package com.soumenprogramming.onlinelearning.place2prepare.notify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Default fallback sender: logs every notification. Always registered so that developers
 * can watch notifications in the backend console even when email is not configured.
 */
@Component
@Order(0)
public class LoggingNotificationSender implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingNotificationSender.class);

    private final boolean enabled;

    public LoggingNotificationSender(
            @Value("${app.notifications.log.enabled:true}") boolean enabled) {
        this.enabled = enabled;
    }

    @Override
    public void send(Notification notification) {
        if (!enabled) return;
        log.info(
                "[notification] to={} type={} title=\"{}\" link={}",
                notification.getUser().getEmail(),
                notification.getType(),
                notification.getTitle(),
                notification.getLink()
        );
    }
}
