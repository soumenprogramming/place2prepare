package com.soumenprogramming.onlinelearning.place2prepare.live;

import com.soumenprogramming.onlinelearning.place2prepare.course.Course;
import com.soumenprogramming.onlinelearning.place2prepare.course.CourseRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLog;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.ActivityLogRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSession;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSessionRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSessionStatus;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.AdminLiveSessionRequest;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.notify.NotificationService;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LiveSessionAdminService {

    private final LiveSessionRepository liveSessionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final NotificationService notificationService;

    public LiveSessionAdminService(LiveSessionRepository liveSessionRepository,
                                   CourseRepository courseRepository,
                                   UserRepository userRepository,
                                   ActivityLogRepository activityLogRepository,
                                   NotificationService notificationService) {
        this.liveSessionRepository = liveSessionRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.notificationService = notificationService;
    }

    public List<LiveSessionResponse> list() {
        return liveSessionRepository.findAllByOrderByScheduledAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public LiveSessionResponse get(Long id) {
        return toResponse(require(id));
    }

    @Transactional
    public LiveSessionResponse create(AdminLiveSessionRequest request, String adminEmail) {
        validate(request);
        Course course = resolveCourse(request.courseId());
        LiveSession session = new LiveSession(
                course,
                request.title().trim(),
                trimToNull(request.description()),
                trimToNull(request.instructorName()),
                trimToNull(request.joinUrl()),
                request.durationMinutes(),
                request.scheduledAt(),
                parseStatus(request.status())
        );
        LiveSession saved = liveSessionRepository.save(session);
        logAction(adminEmail, "Scheduled live session: " + saved.getTitle()
                + (course == null ? " (general)" : " for " + course.getTitle()));
        if (saved.getStatus() == LiveSessionStatus.SCHEDULED
                || saved.getStatus() == LiveSessionStatus.LIVE) {
            notificationService.notifyLiveSessionScheduled(saved);
        }
        return toResponse(saved);
    }

    @Transactional
    public LiveSessionResponse update(Long id, AdminLiveSessionRequest request, String adminEmail) {
        validate(request);
        LiveSession session = require(id);
        LiveSessionStatus previousStatus = session.getStatus();
        Course course = resolveCourse(request.courseId());
        session.setCourse(course);
        session.setTitle(request.title().trim());
        session.setDescription(trimToNull(request.description()));
        session.setInstructorName(trimToNull(request.instructorName()));
        session.setJoinUrl(trimToNull(request.joinUrl()));
        session.setDurationMinutes(request.durationMinutes());
        session.setScheduledAt(request.scheduledAt());
        session.setStatus(parseStatus(request.status()));
        session.touch();
        LiveSession saved = liveSessionRepository.save(session);
        logAction(adminEmail, "Updated live session: " + saved.getTitle());
        if (previousStatus != LiveSessionStatus.CANCELLED
                && saved.getStatus() == LiveSessionStatus.CANCELLED) {
            notificationService.notifyLiveSessionCancelled(saved);
        }
        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id, String adminEmail) {
        LiveSession session = require(id);
        String title = session.getTitle();
        if (session.getStatus() != LiveSessionStatus.COMPLETED
                && session.getStatus() != LiveSessionStatus.CANCELLED) {
            notificationService.notifyLiveSessionCancelled(session);
        }
        liveSessionRepository.delete(session);
        logAction(adminEmail, "Deleted live session: " + title);
    }

    private LiveSession require(Long id) {
        return liveSessionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Live session not found"));
    }

    private Course resolveCourse(Long courseId) {
        if (courseId == null) return null;
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Course not found"));
    }

    private void validate(AdminLiveSessionRequest request) {
        if (request.scheduledAt() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Schedule time is required");
        }
        if (request.durationMinutes() < 5 || request.durationMinutes() > 600) {
            throw new ResponseStatusException(BAD_REQUEST, "Duration must be between 5 and 600 minutes");
        }
    }

    private LiveSessionStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) return LiveSessionStatus.SCHEDULED;
        String normalized = raw.trim().toUpperCase();
        Set<String> allowed = Set.of("SCHEDULED", "LIVE", "COMPLETED", "CANCELLED");
        if (!allowed.contains(normalized)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid status");
        }
        return LiveSessionStatus.valueOf(normalized);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void logAction(String adminEmail, String message) {
        User admin = userRepository.findByEmail(adminEmail.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Admin not found"));
        activityLogRepository.save(new ActivityLog(admin, message, adminEmail));
    }

    private LiveSessionResponse toResponse(LiveSession session) {
        return new LiveSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getDescription(),
                session.getInstructorName(),
                session.getCourse() == null ? null : session.getCourse().getId(),
                session.getCourse() == null ? null : session.getCourse().getTitle(),
                session.getScheduledAt(),
                session.getDurationMinutes(),
                session.getStatus().name(),
                session.getJoinUrl(),
                false,
                null
        );
    }
}
