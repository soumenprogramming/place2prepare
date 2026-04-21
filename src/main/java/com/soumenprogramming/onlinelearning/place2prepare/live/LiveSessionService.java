package com.soumenprogramming.onlinelearning.place2prepare.live;

import com.soumenprogramming.onlinelearning.place2prepare.dashboard.Enrollment;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.EnrollmentStatus;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSession;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSessionRepository;
import com.soumenprogramming.onlinelearning.place2prepare.dashboard.LiveSessionStatus;
import com.soumenprogramming.onlinelearning.place2prepare.learn.EnrollmentAccessService;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionCalendarResponse;
import com.soumenprogramming.onlinelearning.place2prepare.live.dto.LiveSessionResponse;
import com.soumenprogramming.onlinelearning.place2prepare.user.User;
import com.soumenprogramming.onlinelearning.place2prepare.user.UserRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class LiveSessionService {

    private static final Duration JOINABLE_BEFORE = Duration.ofMinutes(15);
    private static final Duration JOINABLE_AFTER = Duration.ofMinutes(30);

    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final LiveSessionRepository liveSessionRepository;
    private final EnrollmentAccessService enrollmentAccessService;

    public LiveSessionService(UserRepository userRepository,
                              EnrollmentRepository enrollmentRepository,
                              LiveSessionRepository liveSessionRepository,
                              EnrollmentAccessService enrollmentAccessService) {
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.liveSessionRepository = liveSessionRepository;
        this.enrollmentAccessService = enrollmentAccessService;
    }

    public LiveSessionCalendarResponse calendarForStudent(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Set<Long> enrolledCourseIds = enrollmentRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE
                        || enrollment.getStatus() == EnrollmentStatus.COMPLETED)
                .map(Enrollment::getCourse)
                .map(course -> course.getId())
                .collect(Collectors.toCollection(HashSet::new));

        List<LiveSession> all = liveSessionRepository.findAllForStudent(sentinelize(enrolledCourseIds));

        Instant now = Instant.now();
        List<LiveSessionResponse> upcoming = new ArrayList<>();
        List<LiveSessionResponse> past = new ArrayList<>();
        for (LiveSession session : all) {
            Instant endsAt = session.getScheduledAt().plus(Duration.ofMinutes(session.getDurationMinutes()));
            boolean isPast = session.getStatus() == LiveSessionStatus.COMPLETED
                    || session.getStatus() == LiveSessionStatus.CANCELLED
                    || endsAt.isBefore(now);
            LiveSessionResponse dto = toResponse(session, enrolledCourseIds, now);
            if (isPast) {
                past.add(dto);
            } else {
                upcoming.add(dto);
            }
        }
        // upcoming: earliest first
        upcoming.sort((a, b) -> a.scheduledAt().compareTo(b.scheduledAt()));
        return new LiveSessionCalendarResponse(upcoming, past);
    }

    public List<LiveSessionResponse> forCourse(String email, Long courseId) {
        Enrollment enrollment = enrollmentAccessService.requireAccess(email, courseId);
        Set<Long> enrolledCourseIds = Set.of(enrollment.getCourse().getId());
        Instant now = Instant.now();
        return liveSessionRepository.findByCourseIdOrderByScheduledAtAsc(courseId).stream()
                .map(session -> toResponse(session, enrolledCourseIds, now))
                .toList();
    }

    /**
     * Returns upcoming sessions for dashboard use (next N combined with enrollments).
     */
    public List<LiveSessionResponse> upcomingForStudent(String email, int limit) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "User not found"));

        Set<Long> enrolledCourseIds = enrollmentRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.ACTIVE)
                .map(enrollment -> enrollment.getCourse().getId())
                .collect(Collectors.toCollection(HashSet::new));

        Instant now = Instant.now();
        return liveSessionRepository.findUpcomingForStudent(now, sentinelize(enrolledCourseIds)).stream()
                .filter(session -> session.getStatus() != LiveSessionStatus.CANCELLED)
                .limit(Math.max(1, limit))
                .map(session -> toResponse(session, enrolledCourseIds, now))
                .toList();
    }

    private Set<Long> sentinelize(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Set.of(-1L);
        }
        return ids;
    }

    private LiveSessionResponse toResponse(LiveSession session, Set<Long> enrolledCourseIds, Instant now) {
        boolean hasAccess;
        String reason;
        if (session.getCourse() == null) {
            hasAccess = true;
            reason = null;
        } else if (enrolledCourseIds.contains(session.getCourse().getId())) {
            hasAccess = true;
            reason = null;
        } else {
            hasAccess = false;
            reason = "Enroll in " + session.getCourse().getTitle() + " to join this session.";
        }

        boolean joinable = hasAccess
                && session.getStatus() != LiveSessionStatus.CANCELLED
                && session.getStatus() != LiveSessionStatus.COMPLETED
                && session.getJoinUrl() != null
                && !session.getJoinUrl().isBlank()
                && !now.isBefore(session.getScheduledAt().minus(JOINABLE_BEFORE))
                && !now.isAfter(session.getScheduledAt()
                        .plus(Duration.ofMinutes(session.getDurationMinutes()))
                        .plus(JOINABLE_AFTER));

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
                hasAccess ? session.getJoinUrl() : null,
                joinable,
                reason
        );
    }
}
