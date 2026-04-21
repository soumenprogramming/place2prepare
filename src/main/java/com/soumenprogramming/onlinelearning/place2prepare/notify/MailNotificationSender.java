package com.soumenprogramming.onlinelearning.place2prepare.notify;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * Delivers notifications as plain-text emails. Only registered when
 * {@code app.notifications.email.enabled=true} and a {@link JavaMailSender} bean is available
 * (Spring Boot auto-configures one when {@code spring.mail.host} is set).
 */
@Component
@ConditionalOnProperty(prefix = "app.notifications.email", name = "enabled", havingValue = "true")
@ConditionalOnBean(JavaMailSender.class)
@Order(10)
public class MailNotificationSender implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(MailNotificationSender.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;
    private final String frontendBaseUrl;

    public MailNotificationSender(JavaMailSender mailSender,
                                  @Value("${app.notifications.email.from:no-reply@place2prepare.local}") String fromAddress,
                                  @Value("${app.frontend.base-url:http://localhost:3000}") String frontendBaseUrl) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    public void send(Notification notification) {
        String to = notification.getUser().getEmail();
        if (to == null || to.isBlank()) return;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject("[Place2Prepare] " + notification.getTitle());
            message.setText(buildBody(notification));
            mailSender.send(message);
        } catch (Exception ex) {
            // Never break the triggering business action. Log and move on.
            log.warn("Failed to send email notification to {}: {}", to, ex.getMessage());
        }
    }

    private String buildBody(Notification notification) {
        StringBuilder body = new StringBuilder();
        body.append(notification.getMessage()).append("\n\n");
        if (notification.getLink() != null && !notification.getLink().isBlank()) {
            String href = notification.getLink();
            if (href.startsWith("/")) {
                href = frontendBaseUrl + href;
            }
            body.append("Open: ").append(href).append("\n\n");
        }
        body.append("— Place2Prepare");
        return body.toString();
    }
}
