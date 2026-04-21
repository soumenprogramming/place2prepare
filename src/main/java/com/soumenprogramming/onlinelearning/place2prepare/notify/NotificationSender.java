package com.soumenprogramming.onlinelearning.place2prepare.notify;

/**
 * Strategy for delivering a notification to an external channel (email, SMS, push, etc.).
 * Senders should be safe to run for every persisted notification and must fail silently or
 * log — they must never break the triggering business action if delivery fails.
 */
public interface NotificationSender {

    /**
     * Deliver the given persisted notification. Called once per notification, after it has
     * been saved to the database.
     */
    void send(Notification notification);
}
