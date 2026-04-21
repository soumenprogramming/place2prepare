package com.soumenprogramming.onlinelearning.place2prepare.notify;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentStatus;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSession;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final DateTimeFormatter WHEN =
            DateTimeFormatter.ofPattern("EEE, MMM d 'at' h:mm a").withZone(ZoneId.systemDefault());

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final List<NotificationSender> senders;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository,
                               EnrollmentRepository enrollmentRepository,
                               List<NotificationSender> senders) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.senders = senders;
    }

    public List<Notification> recent(Long userId, int limit) {
        Pageable page = PageRequest.of(0, Math.max(1, Math.min(limit, 50)));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, page);
    }

    public long unreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public boolean markRead(Long userId, Long notificationId) {
        return notificationRepository.findById(notificationId)
                .filter(n -> n.getUser().getId().equals(userId))
                .map(n -> {
                    if (!n.isRead()) {
                        n.markRead();
                        notificationRepository.save(n);
                    }
                    return true;
                })
                .orElse(false);
    }

    public int markAllRead(Long userId) {
        return notificationRepository.markAllRead(userId);
    }

    // ---- Dispatch helpers ----

    public Notification notify(User user, NotificationType type, String title, String message, String link) {
        Notification saved = notificationRepository.save(new Notification(user, type, title, message, link));
        for (NotificationSender sender : senders) {
            try {
                sender.send(saved);
            } catch (Exception ex) {
                log.warn("Notification sender {} failed: {}",
                        sender.getClass().getSimpleName(), ex.getMessage());
            }
        }
        return saved;
    }

    public void notifyCourseAssigned(User student, Course course, String planType) {
        notify(
                student,
                NotificationType.COURSE_ASSIGNED,
                "You've been enrolled in " + course.getTitle(),
                "An admin assigned you to " + course.getTitle() + " ("
                        + (planType == null ? "BASIC" : planType.toUpperCase())
                        + " plan). You can start learning right away.",
                "/courses/" + course.getId()
        );
    }

    public void notifyCourseRemoved(User student, Course course) {
        notify(
                student,
                NotificationType.COURSE_REMOVED,
                "Enrollment removed: " + course.getTitle(),
                "Your access to " + course.getTitle() + " has been removed by an admin. "
                        + "Reach out if you believe this was a mistake.",
                "/dashboard"
        );
    }

    public void notifyLiveSessionScheduled(LiveSession session) {
        String when = WHEN.format(session.getScheduledAt());
        String title = "New live session: " + session.getTitle();
        String message = session.getCourse() == null
                ? "Community session scheduled for " + when + ". Join 15 minutes before start."
                : "A new live session for " + session.getCourse().getTitle()
                        + " is scheduled for " + when + ".";
        String link = session.getCourse() == null
                ? "/live"
                : "/courses/" + session.getCourse().getId();

        for (User recipient : audienceFor(session)) {
            notify(recipient, NotificationType.LIVE_SESSION_SCHEDULED, title, message, link);
        }
    }

    public void notifyLiveSessionCancelled(LiveSession session) {
        String when = WHEN.format(session.getScheduledAt());
        String title = "Live session cancelled: " + session.getTitle();
        String message = "The session originally scheduled for " + when + " has been cancelled.";
        String link = session.getCourse() == null
                ? "/live"
                : "/courses/" + session.getCourse().getId();

        for (User recipient : audienceFor(session)) {
            notify(recipient, NotificationType.LIVE_SESSION_CANCELLED, title, message, link);
        }
    }

    public void notifyPasswordResetRequested(User user, String resetLink) {
        notify(
                user,
                NotificationType.PASSWORD_RESET,
                "Reset your Place2Prepare password",
                "We received a request to reset your password. This link is valid for 30 minutes. "
                        + "If you didn't request a reset, you can ignore this message.",
                resetLink
        );
    }

    private List<User> audienceFor(LiveSession session) {
        if (session.getCourse() == null) {
            // community session — send to everyone (keep small for now by limiting to enrolled users)
            return userRepository.findAll();
        }
        return enrollmentRepository.findByCourseId(session.getCourse().getId()).stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE)
                .map(Enrollment::getUser)
                .distinct()
                .toList();
    }
}
